"""Data access and similarity engine for NASA Analog Finder.

The API server uses only the Python standard library. ``procesar_datos.py``
still handles optional regeneration of the JSON datasets, but the frontend no
longer needs pandas at runtime.

Two data sources are supported:

* ``json`` — the datasets produced by ``procesar_datos.py`` (default when the
  files exist).
* ``csv`` — the curated source tables under ``data/``. Used as a fallback and
  useful for tests.

Missing values are always preserved as ``None``. They are never converted to
zero, because a missing measurement must not change a similarity score.
"""

from __future__ import annotations

import csv
import json
import math
from pathlib import Path
from typing import Any, Iterable

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIR = BASE_DIR / "frontend"

REFERENCE = (
    "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST "
    "MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD"
)

# Keep in sync with the frontend fallback table. The API exposes this catalog
# through GET /api/parameters so the form can use a single source of truth.
PARAMETERS: dict[str, dict[str, Any]] = {
    "Temp_Max(C°)": {
        "label": "Maximum temperature",
        "unit": "°C",
        "scale": 25,
        "weight": 1.2,
        "min": -150,
        "max": 150,
        "step": 0.1,
    },
    "Temp_Min(C°)": {
        "label": "Minimum temperature",
        "unit": "°C",
        "scale": 30,
        "weight": 1.2,
        "min": -200,
        "max": 100,
        "step": 0.1,
    },
    "Amplitud_termica_(Delta_T)": {
        "label": "Thermal range (ΔT)",
        "unit": "°C",
        "scale": 40,
        "weight": 1.3,
        "min": 0,
        "max": 400,
        "step": 0.1,
    },
    "Pendiente°": {
        "label": "Slope",
        "unit": "°",
        "scale": 5,
        "weight": 1,
        "min": 0,
        "max": 90,
        "step": 0.01,
    },
    "Indice_vegetacion(NDVI)": {
        "label": "Vegetation index",
        "unit": "NDVI",
        "scale": 0.15,
        "weight": 0.8,
        "min": 0,
        "max": 1,
        "step": 0.01,
    },
    "Polvo/aerosoles": {
        "label": "Dust / aerosol",
        "unit": "AOD",
        "scale": 0.2,
        "weight": 1,
        "min": 0,
        "max": 5,
        "step": 0.01,
    },
    "Azufres_Sulfatos": {
        "label": "Sulfate index",
        "unit": "index",
        "scale": 0.25,
        "weight": 1.3,
        "min": 0,
        "max": 5,
        "step": 0.01,
    },
}

PARAM_KEYS = tuple(PARAMETERS)
BODY_ALIASES = {
    "moon": "Luna",
    "luna": "Luna",
    "mars": "Marte",
    "marte": "Marte",
}


class DataError(RuntimeError):
    """Raised when the curated datasets cannot be read."""


# --------------------------------------------------------------------------- #
# Numeric helpers
# --------------------------------------------------------------------------- #


def _number(value: Any) -> float | int | None:
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    text = str(value).strip()
    if not text:
        return None
    try:
        number = float(text)
    except (TypeError, ValueError):
        return None
    if not math.isfinite(number):
        return None
    return int(number) if number.is_integer() else number


def has_value(value: Any) -> bool:
    return value is not None and value != "" and math.isfinite(float(value))


def _read_csv(path: Path) -> list[dict[str, str]]:
    if not path.is_file():
        raise DataError(f"Missing dataset: {path}")
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


# --------------------------------------------------------------------------- #
# Dataset loading
# --------------------------------------------------------------------------- #


def _coerce_record(record: dict[str, Any], numeric: Iterable[str]) -> dict[str, Any]:
    result = dict(record)
    for key in numeric:
        result[key] = _number(record.get(key))
    return result


def _normalise_target(record: dict[str, Any]) -> dict[str, Any]:
    target = _coerce_record(record, ("Latitud", "Longitud", *PARAM_KEYS))
    target.setdefault("Tipo", "OBJETO")
    target.setdefault("Referencias", "")
    return target


def _normalise_candidate(record: dict[str, Any]) -> dict[str, Any]:
    candidate = _coerce_record(
        record, ("Latitud", "Longitud", *PARAM_KEYS)
    )
    if candidate.get("Amplitud_termica_(Delta_T)") is None:
        maximum = candidate.get("Temp_Max(C°)")
        minimum = candidate.get("Temp_Min(C°)")
        if maximum is not None and minimum is not None:
            candidate["Amplitud_termica_(Delta_T)"] = maximum - minimum
    candidate.setdefault("Tipo", "CANDIDATO_TIERRA")
    candidate.setdefault("Referencias", REFERENCE)
    return candidate


def _load_json(frontend_dir: Path) -> tuple[list[dict], list[dict]] | None:
    targets_path = frontend_dir / "data" / "objetivos_espaciales.json"
    candidates_path = frontend_dir / "data" / "tierra_procesada.json"
    if not targets_path.is_file() or not candidates_path.is_file():
        return None
    try:
        with targets_path.open("r", encoding="utf-8") as handle:
            raw_targets = json.load(handle)
        with candidates_path.open("r", encoding="utf-8") as handle:
            raw_candidates = json.load(handle)
    except (OSError, json.JSONDecodeError) as error:
        raise DataError(f"Could not read the JSON datasets: {error}") from error
    if not isinstance(raw_targets, list) or not isinstance(raw_candidates, list):
        raise DataError("The JSON datasets must contain lists.")
    return (
        [_normalise_target(item) for item in raw_targets],
        [_normalise_candidate(item) for item in raw_candidates],
    )


def _load_csv(data_dir: Path) -> tuple[list[dict], list[dict]]:
    targets: list[dict[str, Any]] = []
    for filename in ("objetivos_luna.csv", "objetivos_marte.csv"):
        for row in _read_csv(data_dir / filename):
            targets.append(
                _normalise_target(
                    {
                        "Sitio": row.get("Sitio", ""),
                        "Tipo": row.get("Tipo", "OBJETO"),
                        "Cuerpo": row.get("Cuerpo", ""),
                        "Latitud": row.get("Latitud"),
                        "Longitud": row.get("Longitud"),
                        **{key: row.get(key) for key in PARAM_KEYS},
                        "Referencias": row.get("Referencias", ""),
                    }
                )
            )

    candidates: list[dict[str, Any]] = []
    for row in _read_csv(data_dir / "candidatos_tierra.csv"):
        maximum = _number(row.get("Fallback_Temp_Max"))
        minimum = _number(row.get("Fallback_Temp_Min"))
        candidates.append(
            _normalise_candidate(
                {
                    "Sitio": row.get("Sitio", ""),
                    "Pais_Region": row.get("Pais_Region", ""),
                    "Tipo_Entorno": row.get("Tipo_Entorno", ""),
                    "Tipo": "CANDIDATO_TIERRA",
                    "Latitud": row.get("Latitud"),
                    "Longitud": row.get("Longitud"),
                    "Temp_Max(C°)": maximum,
                    "Temp_Min(C°)": minimum,
                    "Amplitud_termica_(Delta_T)": (
                        maximum - minimum
                        if maximum is not None and minimum is not None
                        else None
                    ),
                    "Pendiente°": row.get("Fallback_Pendiente"),
                    "Indice_vegetacion(NDVI)": row.get("Fallback_NDVI"),
                    "Polvo/aerosoles": row.get("Polvo/aerosoles"),
                    "Azufres_Sulfatos": row.get("Fallback_Azufres_Sulfatos"),
                    "Imagen_URL": row.get("Imagen_URL", ""),
                    "Referencias": REFERENCE,
                }
            )
        )

    return targets, candidates


def load_datasets(
    data_dir: Path = DATA_DIR,
    frontend_dir: Path = FRONTEND_DIR,
    source: str = "auto",
) -> tuple[list[dict], list[dict], str]:
    """Return ``(targets, candidates, source_used)``."""
    source = (source or "auto").lower()
    if source not in {"auto", "json", "csv"}:
        raise DataError("source must be 'auto', 'json' or 'csv'")

    if source in {"auto", "json"}:
        loaded = _load_json(frontend_dir)
        if loaded is not None:
            return loaded[0], loaded[1], "json"
        if source == "json":
            raise DataError("The JSON datasets are not available.")

    targets, candidates = _load_csv(data_dir)
    return targets, candidates, "csv"


def select_targets(targets: list[dict], body: str | None) -> list[dict]:
    if not body:
        return list(targets)
    canonical = BODY_ALIASES.get(str(body).strip().lower())
    if not canonical:
        raise ValueError("body must be Moon/Luna or Mars/Marte")
    return [target for target in targets if target.get("Cuerpo") == canonical]


# --------------------------------------------------------------------------- #
# Similarity
# --------------------------------------------------------------------------- #


def compare(candidate: dict, target: dict) -> dict[str, Any]:
    """Weighted Gaussian distance over parameters present in both records."""
    weighted = 0.0
    total_weight = 0.0
    breakdown: dict[str, dict[str, float]] = {}

    for key, meta in PARAMETERS.items():
        candidate_value = candidate.get(key)
        target_value = target.get(key)
        if not has_value(candidate_value) or not has_value(target_value):
            continue

        earth = float(candidate_value)
        reference = float(target_value)
        z = abs(earth - reference) / float(meta["scale"])
        score = 100.0 * math.exp(-(z * z))
        breakdown[key] = {
            "earth": earth,
            "target": reference,
            "match": round(score, 1),
        }
        weighted += score * float(meta["weight"])
        total_weight += float(meta["weight"])

    return {
        "score": round(weighted / total_weight, 1) if total_weight else 0.0,
        "parameterCount": len(breakdown),
        "breakdown": breakdown,
    }


def rank_candidates(candidates: Iterable[dict], target: dict) -> list[dict]:
    scored = [
        {**candidate, "match": compare(candidate, target)}
        for candidate in candidates
    ]
    # ``sort`` is stable, so equal scores keep their dataset order.
    scored.sort(key=lambda item: item["match"]["score"], reverse=True)
    return scored


# --------------------------------------------------------------------------- #
# Validation for user-provided targets
# --------------------------------------------------------------------------- #


def validate_target(raw: Any) -> tuple[dict[str, float | None], dict[str, str], int]:
    """Normalise a partial target.

    Returns ``(values, errors, provided)``. Empty fields are ``None`` and are
    excluded from the comparison. Values are checked against the documented
    ranges and units.
    """
    errors: dict[str, str] = {}
    values: dict[str, float | None] = {key: None for key in PARAM_KEYS}
    explicit: set[str] = set()

    if raw is None:
        raw = {}
    if not isinstance(raw, dict):
        return values, {"_form": "The target must be a JSON object."}, 0

    for key, meta in PARAMETERS.items():
        if key not in raw:
            continue
        value = raw[key]
        if value is None:
            continue
        if isinstance(value, bool):
            errors[key] = "Enter a valid number."
            continue
        if isinstance(value, str) and not value.strip():
            continue
        explicit.add(key)

        try:
            number = float(value)
        except (TypeError, ValueError):
            errors[key] = "Enter a valid number."
            continue
        if not math.isfinite(number):
            errors[key] = "Enter a valid number."
            continue
        if number < meta["min"] or number > meta["max"]:
            errors[key] = (
                f"Enter a value between {meta['min']} and {meta['max']} "
                f"{meta['unit']}."
            )
            continue
        values[key] = number

    delta_key = "Amplitud_termica_(Delta_T)"
    maximum = values.get("Temp_Max(C°)")
    minimum = values.get("Temp_Min(C°)")

    # Derive the thermal range only when the user did not type one.
    if delta_key not in explicit and maximum is not None and minimum is not None:
        values[delta_key] = maximum - minimum

    delta = values.get(delta_key)
    if delta is not None and not (PARAMETERS[delta_key]["min"] <= delta <= PARAMETERS[delta_key]["max"]):
        errors.setdefault(
            delta_key,
            f"Enter a value between {PARAMETERS[delta_key]['min']} and "
            f"{PARAMETERS[delta_key]['max']} {PARAMETERS[delta_key]['unit']}.",
        )

    if maximum is not None and minimum is not None and maximum < minimum:
        errors["Temp_Max(C°)"] = (
            "Maximum temperature must be greater than or equal to the minimum."
        )

    provided = sum(
        1
        for key, value in values.items()
        if value is not None and key not in errors
    )

    if provided == 0 and not errors:
        errors["_form"] = "Enter at least one environmental parameter."

    return values, errors, provided


def catalog() -> dict[str, dict[str, Any]]:
    """Return a copy of the parameter catalog."""
    return {key: dict(meta) for key, meta in PARAMETERS.items()}
