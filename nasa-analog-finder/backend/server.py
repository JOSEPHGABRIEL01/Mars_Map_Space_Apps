"""HTTP API and static server for NASA Analog Finder.

Uses only the Python standard library, so the app can run with:

    python backend/server.py

Routes
------
GET  /api/health      service status, data source and dataset counts
GET  /api/parameters  comparable parameter catalog (labels, units, scales)
GET  /api/targets     reference targets, optionally filtered with ?body=Moon
GET  /api/candidates  Earth candidate sites
POST /api/analogs     body: { "body": "Moon", "target": {...} } or
                      { "body": "Moon", "targetId": "South Pole" }.
                      Returns candidates ranked by the real similarity score.

The server also serves the static frontend from ``static_dir`` and injects
``window.ANALOG_API_BASE = "/api"`` into ``index.html`` so the page talks to
this API. Without that injection the frontend stays in offline mode and scores
locally from the JSON bundled by Vite.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import posixpath
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, unquote, urlparse

# Allow ``python backend/server.py`` and ``python -m backend.server``.
sys.path.insert(0, str(Path(__file__).resolve().parent))

import analog_core as core  # noqa: E402

API_PREFIX = "/api"
MAX_BODY_BYTES = 64 * 1024
INJECTION = '<script>window.ANALOG_API_BASE = "/api";</script>'


class ApiError(Exception):
    """A request error that maps to a JSON HTTP response."""

    def __init__(self, status: int, message: str) -> None:
        super().__init__(message)
        self.status = status
        self.message = message


class AnalogService:
    """Dataset-backed application service shared by every request."""

    def __init__(
        self,
        data_dir: Path,
        frontend_dir: Path,
        source: str = "auto",
        candidates_limit: int = 500,
    ) -> None:
        self.data_dir = Path(data_dir)
        self.frontend_dir = Path(frontend_dir)
        self.source = source
        self.candidates_limit = candidates_limit
        self.reload()

    def reload(self) -> None:
        self.targets, self.candidates, self.source_used = core.load_datasets(
            data_dir=self.data_dir,
            frontend_dir=self.frontend_dir,
            source=self.source,
        )

    # -- lookups ----------------------------------------------------------- #

    def resolve_target(self, body: str | None, target: Any, target_id: str | None) -> dict:
        """Return the reference target requested by a POST /api/analogs call."""
        if target is not None:
            if not isinstance(target, dict):
                raise ApiError(400, "target must be a JSON object.")
            values, errors, provided = core.validate_target(target)
            if errors:
                raise ApiError(422, json.dumps({"errors": errors}))
            resolved = {
                **values,
                "Sitio": "Custom target",
                "Tipo": "OBJETO",
                "Cuerpo": core.BODY_ALIASES.get(str(body or "moon").lower(), "Luna"),
                "Referencias": "User-provided environmental parameters",
                "parameterCount": provided,
            }
            return resolved

        available = core.select_targets(self.targets, body)
        if not available:
            raise ApiError(404, "No reference targets are available for that body.")

        if target_id:
            wanted = str(target_id).strip().lower()
            for item in available:
                if str(item.get("Sitio", "")).strip().lower() == wanted:
                    return item
            raise ApiError(404, f"Unknown target: {target_id}")

        return available[0]

    def analogs(self, payload: dict) -> dict:
        body = payload.get("body")
        if body is not None and not isinstance(body, str):
            raise ApiError(400, "body must be a string.")
        target = self.resolve_target(body, payload.get("target"), payload.get("targetId"))
        ranked = core.rank_candidates(self.candidates, target)
        limit = payload.get("limit")
        if limit is not None:
            if isinstance(limit, bool) or not isinstance(limit, int) or limit < 1:
                raise ApiError(400, "limit must be a positive integer.")
            ranked = ranked[:limit]
        return {
            "target": target,
            "source": self.source_used,
            "parameterCount": target.get("parameterCount")
            or sum(
                1
                for key in core.PARAM_KEYS
                if core.has_value(target.get(key))
            ),
            "totalParameters": len(core.PARAM_KEYS),
            "results": ranked,
        }

    def health(self) -> dict:
        return {
            "status": "ok",
            "source": self.source_used,
            "targets": len(self.targets),
            "candidates": len(self.candidates),
            "parameters": len(core.PARAM_KEYS),
        }

    def targets_payload(self, body: str | None) -> dict:
        try:
            selected = core.select_targets(self.targets, body)
        except ValueError as error:
            raise ApiError(400, str(error)) from error
        return {"source": self.source_used, "targets": selected}

    def candidates_payload(self) -> dict:
        # Coordinates without a valid pair cannot be placed on the map, but the
        # record is still returned so the ranking stays complete.
        return {
            "source": self.source_used,
            "candidates": self.candidates[: self.candidates_limit],
            "total": len(self.candidates),
        }


class AnalogRequestHandler(BaseHTTPRequestHandler):
    server_version = "AnalogFinder/1.0"
    protocol_version = "HTTP/1.1"

    # Populated by ``build_server``.
    service: AnalogService
    static_dir: Path

    # -- logging ----------------------------------------------------------- #

    def log_message(self, format: str, *args: Any) -> None:  # noqa: A002
        sys.stderr.write(
            "%s - %s\n" % (self.address_string(), format % args)
        )

    # -- helpers ----------------------------------------------------------- #

    def _cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, payload: Any, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self._cors_headers()
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(body)

    def _send_error_json(self, status: int, message: str) -> None:
        self._send_json({"error": message}, status)

    def _read_json_body(self) -> dict:
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError as error:
            raise ApiError(400, "Invalid Content-Length header.") from error
        if length <= 0:
            return {}
        if length > MAX_BODY_BYTES:
            raise ApiError(413, "Request body is too large.")
        raw = self.rfile.read(length)
        try:
            payload = json.loads(raw.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ApiError(400, "Request body must be valid JSON.") from error
        if not isinstance(payload, dict):
            raise ApiError(400, "Request body must be a JSON object.")
        return payload

    # -- HTTP verbs -------------------------------------------------------- #

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Content-Length", "0")
        self._cors_headers()
        self.end_headers()

    def do_HEAD(self) -> None:  # noqa: N802
        self._dispatch()

    def do_GET(self) -> None:  # noqa: N802
        self._dispatch()

    def do_POST(self) -> None:  # noqa: N802
        self._dispatch()

    def _dispatch(self) -> None:
        parsed = urlparse(self.path)
        path = unquote(parsed.path)

        if path == API_PREFIX or path.startswith(API_PREFIX + "/"):
            self._handle_api(path, parse_qs(parsed.query))
            return

        if self.command not in {"GET", "HEAD"}:
            self._send_error_json(405, "Method not allowed.")
            return

        self._serve_static(path)

    # -- API --------------------------------------------------------------- #

    def _handle_api(self, path: str, query: dict[str, list[str]]) -> None:
        route = path[len(API_PREFIX) :] or "/"
        first = lambda name: (query.get(name) or [None])[0]  # noqa: E731

        try:
            if self.command in {"GET", "HEAD"} and route in {"/", "/health"}:
                self._send_json(self.service.health())
                return

            if self.command in {"GET", "HEAD"} and route == "/parameters":
                self._send_json(
                    {
                        "source": self.service.source_used,
                        "parameters": core.catalog(),
                        "order": list(core.PARAM_KEYS),
                    }
                )
                return

            if self.command in {"GET", "HEAD"} and route == "/targets":
                self._send_json(self.service.targets_payload(first("body")))
                return

            if self.command in {"GET", "HEAD"} and route == "/candidates":
                self._send_json(self.service.candidates_payload())
                return

            if self.command == "POST" and route == "/analogs":
                payload = self._read_json_body()
                self._send_json(self.service.analogs(payload))
                return

            if route in {
                "/health",
                "/parameters",
                "/targets",
                "/candidates",
                "/analogs",
            }:
                self._send_error_json(405, "Method not allowed for this route.")
                return

            self._send_error_json(404, f"Unknown API route: {route}")
        except ApiError as error:
            if error.status == 422:
                try:
                    details = json.loads(error.message)
                except json.JSONDecodeError:
                    details = {"errors": {"_form": error.message}}
                self._send_json(details, 422)
            else:
                self._send_error_json(error.status, error.message)
        except (core.DataError, OSError) as error:
            self._send_error_json(500, f"Dataset error: {error}")
        except Exception as error:  # noqa: BLE001 - keep the API in JSON
            self.log_error("Unhandled API error: %r", error)
            self._send_error_json(500, "Internal server error.")

    # -- Static frontend --------------------------------------------------- #

    def _resolve_static(self, path: str) -> Path | None:
        clean = posixpath.normpath(path).lstrip("/")
        if clean in {"", "."}:
            clean = "index.html"
        candidate = (self.static_dir / clean).resolve()
        root = self.static_dir.resolve()
        try:
            candidate.relative_to(root)
        except ValueError:
            return None
        if candidate.is_dir():
            candidate = candidate / "index.html"
        return candidate if candidate.is_file() else None

    def _serve_static(self, path: str) -> None:
        target = self._resolve_static(path)
        if target is None:
            self._send_error_json(404, "Not found.")
            return

        raw = target.read_bytes()
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        charset = ""

        if target.name == "index.html":
            text = raw.decode("utf-8")
            # Inject the API base into the served copy only. Inserting it before
            # </head> also works with Vite's hashed module scripts.
            if INJECTION not in text:
                if "</head>" in text:
                    text = text.replace("</head>", f"    {INJECTION}\n  </head>", 1)
                else:
                    text = f"{INJECTION}\n{text}"
            raw = text.encode("utf-8")
            content_type = "text/html"
            charset = "; charset=utf-8"

        if target.suffix in {".js", ".css", ".json", ".svg"}:
            charset = "; charset=utf-8"

        self.send_response(200)
        self.send_header("Content-Type", content_type + charset)
        self.send_header("Content-Length", str(len(raw)))
        self.send_header(
            "Cache-Control",
            "no-store" if target.name == "index.html" else "public, max-age=300",
        )
        self._cors_headers()
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(raw)


def build_server(
    host: str = "127.0.0.1",
    port: int = 8000,
    data_dir: Path = core.DATA_DIR,
    frontend_dir: Path = core.FRONTEND_DIR,
    static_dir: Path | None = None,
    source: str = "auto",
) -> ThreadingHTTPServer:
    static_root = Path(static_dir) if static_dir is not None else Path(frontend_dir)
    service = AnalogService(data_dir=data_dir, frontend_dir=frontend_dir, source=source)
    handler = type(
        "BoundAnalogRequestHandler",
        (AnalogRequestHandler,),
        {"service": service, "static_dir": static_root},
    )
    httpd = ThreadingHTTPServer((host, port), handler)
    httpd.daemon_threads = True
    httpd.service = service  # type: ignore[attr-defined]
    httpd.static_dir = static_root  # type: ignore[attr-defined]
    return httpd


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="NASA Analog Finder server")
    parser.add_argument("--host", default="127.0.0.1", help="Bind host")
    parser.add_argument("--port", type=int, default=8000, help="Bind port")
    parser.add_argument(
        "--data-dir",
        type=Path,
        default=core.DATA_DIR,
        help="Directory with the curated CSV files",
    )
    parser.add_argument(
        "--frontend-dir",
        type=Path,
        default=core.FRONTEND_DIR,
        help="Directory with data/*.json used by the API",
    )
    parser.add_argument(
        "--static-dir",
        type=Path,
        default=None,
        help="Built frontend directory (default: same as --frontend-dir)",
    )
    parser.add_argument(
        "--source",
        choices=("auto", "json", "csv"),
        default="auto",
        help="Dataset source (default: JSON when present, otherwise CSV)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    try:
        httpd = build_server(
            host=args.host,
            port=args.port,
            data_dir=args.data_dir,
            frontend_dir=args.frontend_dir,
            static_dir=args.static_dir,
            source=args.source,
        )
    except core.DataError as error:
        print(f"Could not start the server: {error}", file=sys.stderr)
        return 1

    host, port = httpd.server_address[:2]
    print(f"NASA Analog Finder running at http://{host}:{port}/")
    print(f"Data source: {httpd.service.source_used}")
    print(f"Targets: {len(httpd.service.targets)}  Candidates: {len(httpd.service.candidates)}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
