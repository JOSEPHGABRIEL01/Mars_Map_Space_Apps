"""HTTP integration tests for the Analog Finder server.

Run from the backend directory:

    python -m unittest -v
"""

from __future__ import annotations

import json
import threading
import unittest
import urllib.error
import urllib.request

import analog_core as core
import server


class ServerTestCase(unittest.TestCase):
    source = "auto"

    @classmethod
    def setUpClass(cls) -> None:
        cls.httpd = server.build_server(
            host="127.0.0.1",
            port=0,
            source=cls.source,
        )
        cls.thread = threading.Thread(target=cls.httpd.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = "http://127.0.0.1:%d" % cls.httpd.server_address[1]

    @classmethod
    def tearDownClass(cls) -> None:
        cls.httpd.shutdown()
        cls.httpd.server_close()
        cls.thread.join(timeout=5)

    def request(self, path: str, method: str = "GET", payload: dict | None = None):
        data = None
        headers = {}
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers["Content-Type"] = "application/json"
        request = urllib.request.Request(
            self.base + path, data=data, headers=headers, method=method
        )
        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                return response.status, response.headers, response.read()
        except urllib.error.HTTPError as error:
            return error.code, error.headers, error.read()

    def json_request(self, path: str, method: str = "GET", payload: dict | None = None):
        status, headers, body = self.request(path, method, payload)
        return status, headers, json.loads(body.decode("utf-8"))

    # -- API --------------------------------------------------------------- #

    def test_health(self) -> None:
        status, _, data = self.json_request("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(data["status"], "ok")
        self.assertEqual(data["targets"], 4)
        self.assertEqual(data["candidates"], 50)
        self.assertEqual(data["parameters"], 7)

    def test_parameters_catalog(self) -> None:
        status, _, data = self.json_request("/api/parameters")
        self.assertEqual(status, 200)
        self.assertEqual(len(data["parameters"]), 7)
        self.assertEqual(data["order"][0], "Temp_Max(C°)")
        self.assertEqual(data["parameters"]["Pendiente°"]["unit"], "°")

    def test_targets_filter(self) -> None:
        status, _, data = self.json_request("/api/targets?body=Moon")
        self.assertEqual(status, 200)
        self.assertEqual(len(data["targets"]), 2)
        self.assertTrue(all(item["Cuerpo"] == "Luna" for item in data["targets"]))

    def test_targets_invalid_body(self) -> None:
        status, _, data = self.json_request("/api/targets?body=Pluto")
        self.assertEqual(status, 400)
        self.assertIn("error", data)

    def test_candidates(self) -> None:
        status, _, data = self.json_request("/api/candidates")
        self.assertEqual(status, 200)
        self.assertEqual(data["total"], 50)
        self.assertEqual(len(data["candidates"]), 50)
        self.assertIn("Latitud", data["candidates"][0])

    def test_analogs_with_preset_target(self) -> None:
        status, _, data = self.json_request(
            "/api/analogs",
            "POST",
            {"body": "Moon", "targetId": "South Pole"},
        )
        self.assertEqual(status, 200)
        self.assertEqual(data["parameterCount"], 7)
        self.assertEqual(data["totalParameters"], 7)
        self.assertEqual(len(data["results"]), 50)
        scores = [item["match"]["score"] for item in data["results"]]
        self.assertEqual(scores, sorted(scores, reverse=True))
        self.assertLessEqual(scores[0], 100.0)

    def test_analogs_with_partial_custom_target(self) -> None:
        status, _, data = self.json_request(
            "/api/analogs",
            "POST",
            {
                "body": "Mars",
                "target": {"Pendiente°": 5, "Indice_vegetacion(NDVI)": 0.08},
            },
        )
        self.assertEqual(status, 200)
        self.assertEqual(data["parameterCount"], 2)
        self.assertTrue(all(item["match"]["parameterCount"] == 2 for item in data["results"]))

    def test_analogs_derives_thermal_range(self) -> None:
        status, _, data = self.json_request(
            "/api/analogs",
            "POST",
            {
                "body": "Moon",
                "target": {"Temp_Max(C°)": 46, "Temp_Min(C°)": 6},
            },
        )
        self.assertEqual(status, 200)
        self.assertEqual(
            data["target"]["Amplitud_termica_(Delta_T)"], 40
        )
        self.assertEqual(data["parameterCount"], 3)

    def test_analogs_respects_limit(self) -> None:
        status, _, data = self.json_request(
            "/api/analogs",
            "POST",
            {"body": "Moon", "targetId": "Marius hills", "limit": 5},
        )
        self.assertEqual(status, 200)
        self.assertEqual(len(data["results"]), 5)

    def test_analogs_invalid_target_returns_422(self) -> None:
        status, _, data = self.json_request(
            "/api/analogs",
            "POST",
            {"body": "Moon", "target": {"Temp_Max(C°)": -500}},
        )
        self.assertEqual(status, 422)
        self.assertIn("Temp_Max(C°)", data["errors"])

    def test_analogs_unknown_target_returns_404(self) -> None:
        status, _, data = self.json_request(
            "/api/analogs",
            "POST",
            {"body": "Moon", "targetId": "Nowhere"},
        )
        self.assertEqual(status, 404)
        self.assertIn("error", data)

    def test_analogs_rejects_invalid_json(self) -> None:
        request = urllib.request.Request(
            self.base + "/api/analogs",
            data=b"not json",
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(request, timeout=5)
        except urllib.error.HTTPError as error:
            self.assertEqual(error.code, 400)
            body = json.loads(error.read().decode("utf-8"))
            self.assertIn("error", body)
        else:
            self.fail("Invalid JSON should be rejected")

    def test_analogs_rejects_wrong_method(self) -> None:
        status, _, data = self.json_request("/api/analogs")
        self.assertEqual(status, 405)
        self.assertIn("error", data)

    def test_unknown_route_returns_404(self) -> None:
        status, _, data = self.json_request("/api/unknown")
        self.assertEqual(status, 404)
        self.assertIn("error", data)

    def test_cors_preflight(self) -> None:
        status, headers, _ = self.request("/api/health", "OPTIONS")
        self.assertEqual(status, 204)
        self.assertEqual(headers["Access-Control-Allow-Origin"], "*")
        self.assertIn("POST", headers["Access-Control-Allow-Methods"])

    def test_api_responses_include_cors(self) -> None:
        status, headers, _ = self.request("/api/health")
        self.assertEqual(status, 200)
        self.assertEqual(headers["Access-Control-Allow-Origin"], "*")

    # -- Static frontend --------------------------------------------------- #

    def test_index_injects_api_base(self) -> None:
        status, headers, body = self.request("/")
        self.assertEqual(status, 200)
        self.assertIn("text/html", headers["Content-Type"])
        self.assertIn('window.ANALOG_API_BASE = "/api"', body.decode("utf-8"))
        self.assertIn("app.js", body.decode("utf-8"))

    def test_static_assets_are_served(self) -> None:
        status, headers, body = self.request("/app.js")
        self.assertEqual(status, 200)
        self.assertIn("javascript", headers["Content-Type"])
        self.assertIn(b"rankAndRender", body)
        status, _, body = self.request("/styles.css")
        self.assertEqual(status, 200)
        self.assertIn(b"--map-bg", body)

    def test_dataset_files_are_served(self) -> None:
        status, headers, body = self.request("/data/tierra_procesada.json")
        self.assertEqual(status, 200)
        self.assertIn("json", headers["Content-Type"])
        self.assertEqual(len(json.loads(body)), 50)

    def test_missing_static_file_is_404(self) -> None:
        status, _, data = self.json_request("/missing-file.js")
        self.assertEqual(status, 404)

    def test_path_traversal_is_blocked(self) -> None:
        status, _, _ = self.request("/../backend/server.py")
        self.assertEqual(status, 404)


class CsvServerTests(ServerTestCase):
    source = "csv"

    def test_csv_source_is_reported(self) -> None:
        _, _, data = self.json_request("/api/health")
        self.assertEqual(data["source"], "csv")


if __name__ == "__main__":
    unittest.main()
