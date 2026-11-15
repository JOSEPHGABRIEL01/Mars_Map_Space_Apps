"""Build the static datasets used by NASA Analog Finder.

The default mode deliberately uses the curated fallback values.  This makes
the demo deterministic and usable offline.  ``--live-api`` enables a best-
effort Planetary Computer lookup; every failed or cloudy observation falls
back to the corresponding CSV value.
"""
from __future__ import annotations

import argparse
import math
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = ROOT / "frontend" / "data"
REFERENCE = (
    "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST "
    "MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD"
)
NUMERIC = [
    "Temp_Max(C°)", "Temp_Min(C°)", "Amplitud_termica_(Delta_T)",
    "Pendiente°", "Indice_vegetacion(NDVI)", "Polvo/aerosoles",
    "Azufres_Sulfatos",
]


def read_space_targets() -> None:
    luna = pd.read_csv(DATA / "objetivos_luna.csv")
    marte = pd.read_csv(DATA / "objetivos_marte.csv")
    OUT.mkdir(parents=True, exist_ok=True)
    pd.concat([luna, marte], ignore_index=True).to_json(
        OUT / "objetivos_espaciales.json", orient="records", indent=2,
        force_ascii=False
    )


def _maybe_float(value: Any) -> float | None:
    """Return a finite float or ``None``; missing data must stay missing."""
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return number if math.isfinite(number) else None


def _fallback(row: pd.Series) -> dict[str, float | None]:
    return {
        "Temp_Max(C°)": _maybe_float(row["Fallback_Temp_Max"]),
        "Temp_Min(C°)": _maybe_float(row["Fallback_Temp_Min"]),
        "Pendiente°": _maybe_float(row["Fallback_Pendiente"]),
        "Indice_vegetacion(NDVI)": _maybe_float(row["Fallback_NDVI"]),
        "Azufres_Sulfatos": _maybe_float(row["Fallback_Azufres_Sulfatos"]),
    }


def _live_metrics(row: pd.Series) -> dict[str, float]:
    """Try to sample STAC assets without making live mode a hard dependency.

    Remote raster schemas and availability change over time, so each asset is
    isolated behind a try/except and the caller merges only valid numbers.
    The fallback remains authoritative when an asset is unavailable.
    """
    try:
        import planetary_computer as pc
        from pystac_client import Client
        import rasterio
        from rasterio.windows import from_bounds

        lon, lat = float(row.Longitud), float(row.Latitud)
        catalog = Client.open(
            "https://planetarycomputer.microsoft.com/api/stac/v1",
            modifier=pc.sign_inplace,
        )
        result: dict[str, float] = {}

        dem_search = catalog.search(collections=["nasadem"],
                                     intersects={"type": "Point", "coordinates": [lon, lat]})
        dem_item = next(iter(dem_search.items()), None)
        if dem_item:
            asset = next(iter(dem_item.assets.values()))
            with rasterio.open(asset.href) as src:
                r, c = src.index(lon, lat)
                window = rasterio.windows.Window(max(0, c - 2), max(0, r - 2), 5, 5)
                values = src.read(1, window=window, masked=True).astype(float)
                if values.count() > 4:
                    gy, gx = np.gradient(values.filled(np.nan))
                    result["Pendiente°"] = float(np.degrees(np.arctan(np.nanmean(np.hypot(gx, gy)))))

        # A small search window is enough for point sampling.  MODIS assets
        # commonly expose the requested bands under these exact names.
        modis = catalog.search(collections=["modis-11A1-061"],
                                intersects={"type": "Point", "coordinates": [lon, lat]},
                                max_items=1)
        item = next(iter(modis.items()), None)
        if item:
            for key, output in (("LST_Day_1km", "Temp_Max(C°)"), ("LST_Night_1km", "Temp_Min(C°)")):
                if key in item.assets:
                    with rasterio.open(item.assets[key].href) as src:
                        row_idx, col_idx = src.index(lon, lat)
                        window = rasterio.windows.Window(col_idx, row_idx, 1, 1)
                        value = src.read(1, 1, window=window)[0, 0]
                        if np.isfinite(value):
                            result[output] = float(value) * 0.02 - 273.15

        landsat = catalog.search(collections=["landsat-c2-l2"],
                                 intersects={"type": "Point", "coordinates": [lon, lat]},
                                 max_items=1)
        item = next(iter(landsat.items()), None)
        if item:
            samples: dict[str, float] = {}
            for key in ("red", "nir08", "swir16", "swir22"):
                if key not in item.assets:
                    continue
                with rasterio.open(item.assets[key].href) as src:
                    row_idx, col_idx = src.index(lon, lat)
                    value = src.read(1, 1, window=rasterio.windows.Window(col_idx, row_idx, 1, 1))[0, 0]
                    if np.isfinite(value):
                        samples[key] = float(value)
            if samples.get("nir08", 0) + samples.get("red", 0) != 0:
                result["Indice_vegetacion(NDVI)"] = (samples["nir08"] - samples["red"]) / (samples["nir08"] + samples["red"])
            if samples.get("swir22", 0) != 0:
                result["Azufres_Sulfatos"] = samples.get("swir16", 0) / samples["swir22"]
        return result
    except Exception:
        return {}


def process_earth(live_api: bool = False) -> None:
    df = pd.read_csv(DATA / "candidatos_tierra.csv")
    records: list[dict[str, Any]] = []
    for _, row in df.iterrows():
        values = _fallback(row)
        if live_api:
            values.update({k: v for k, v in _live_metrics(row).items() if math.isfinite(v)})
        # Derive the thermal range only when both temperatures are known.
        maximum = values["Temp_Max(C°)"]
        minimum = values["Temp_Min(C°)"]
        values["Amplitud_termica_(Delta_T)"] = (
            maximum - minimum
            if maximum is not None and minimum is not None
            else None
        )
        record = {
            "Sitio": row["Sitio"], "Pais_Region": row["Pais_Region"],
            "Tipo_Entorno": row["Tipo_Entorno"], "Tipo": "CANDIDATO_TIERRA",
            "Latitud": float(row["Latitud"]), "Longitud": float(row["Longitud"]),
            **values, "Polvo/aerosoles": _maybe_float(row["Polvo/aerosoles"]),
            "Imagen_URL": row["Imagen_URL"], "Referencias": REFERENCE,
        }
        records.append(record)
    result = pd.DataFrame(records)
    result[NUMERIC] = result[NUMERIC].apply(pd.to_numeric, errors="coerce")
    # Missing measurements stay null: a missing value must never be read as 0,
    # because that would change the similarity score.
    result[NUMERIC] = result[NUMERIC].replace([np.inf, -np.inf], np.nan)
    result.to_json(OUT / "tierra_procesada.json", orient="records", indent=2, force_ascii=False)


def main() -> None:
    parser = argparse.ArgumentParser(description="Regenerate the static JSON datasets")
    parser.add_argument("--live-api", action="store_true", help="Try the Planetary Computer API")
    args = parser.parse_args()
    read_space_targets()
    process_earth(args.live_api)
    print(f"Datasets written to {OUT}")


if __name__ == "__main__":
    main()
