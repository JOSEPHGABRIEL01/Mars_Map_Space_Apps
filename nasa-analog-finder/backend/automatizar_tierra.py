"""Generate a large, filtered Earth analogue catalogue.

The default ``--fast-seed`` mode is deterministic and offline apart from the
land-mask and reverse-geocoder package data.  ``--live-api`` enriches the same
grid with best-effort Planetary Computer samples in parallel; failed samples
fall back to the deterministic estimates.  The estimates are deliberately
marked as proxies in ``Referencias`` and should not be treated as laboratory
measurements.

Examples::

    python backend/automatizar_tierra.py --fast-seed
    python backend/automatizar_tierra.py --live-api --step 5 --max-points 1000
"""
from __future__ import annotations

import argparse
import math
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from global_land_mask import globe
from tqdm import tqdm

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
FRONTEND_DATA = ROOT / "frontend" / "data"
REFERENCE = (
    "NASA Analog Finder proxy estimate; NASADEM / MODIS / Landsat via "
    "Microsoft Planetary Computer when available"
)
NUMERIC = [
    "Temp_Max(C°)", "Temp_Min(C°)", "Amplitud_termica_(Delta_T)",
    "Pendiente°", "Indice_vegetacion(NDVI)", "Polvo/aerosoles",
    "Azufres_Sulfatos",
]


def _proxy_values(lat: float, lon: float) -> dict[str, float]:
    """Return deterministic, bounded values for an arid/polar seed point."""
    radians = math.radians(lat)
    seasonal = math.sin(math.radians(lon * 1.7 + lat * 2.3))
    polar = abs(lat) / 90.0
    aridity = np.clip(0.35 + 0.42 * abs(math.sin(radians)) + 0.15 * abs(seasonal), 0, 0.98)
    ndvi = float(np.clip(0.02 + 0.12 * (1 - aridity) + 0.025 * abs(seasonal), 0, 0.18))
    mean_temp = 28 * (1 - polar) - 42 * polar + 5 * seasonal
    thermal_range = 18 + 42 * aridity + 8 * abs(seasonal)
    minimum = mean_temp - thermal_range / 2
    maximum = mean_temp + thermal_range / 2
    slope = float(np.clip(1.0 + 15 * abs(math.sin(math.radians(lat * 3 + lon))), 0.2, 24))
    return {
        "Temp_Max(C°)": round(maximum, 2),
        "Temp_Min(C°)": round(minimum, 2),
        "Pendiente°": round(slope, 2),
        "Indice_vegetacion(NDVI)": round(ndvi, 4),
        "Polvo/aerosoles": round(float(np.clip(0.08 + 0.8 * aridity + 0.08 * abs(seasonal), 0, 1)), 4),
        "Azufres_Sulfatos": round(float(np.clip(0.35 + 1.45 * aridity, 0, 2)), 4),
    }


def _reverse_names(coords: list[tuple[float, float]]) -> list[tuple[str, str]]:
    import reverse_geocoder as rg

    results = rg.search(coords, mode=2, verbose=False)
    return [
        (
            str(item.get("name") or "Unnamed region"),
            str(item.get("cc") or "Earth") if str(item.get("cc") or "Earth").lower() != "nan" else "Earth",
        )
        for item in results
    ]


def _grid(step: float) -> list[tuple[float, float]]:
    latitudes = np.arange(-80, 80.0001, step)
    longitudes = np.arange(-180, 180.0001, step)
    points = [(round(float(lat), 5), round(float(lon), 5)) for lat in latitudes for lon in longitudes]
    return [(lat, lon) for lat, lon in points if bool(globe.is_land(lat, lon))]


def _curated() -> pd.DataFrame:
    source = pd.read_csv(DATA / "candidatos_tierra.csv")
    rows: list[dict[str, Any]] = []
    for _, row in source.iterrows():
        values = {
            "Temp_Max(C°)": float(row["Fallback_Temp_Max"]),
            "Temp_Min(C°)": float(row["Fallback_Temp_Min"]),
            "Pendiente°": float(row["Fallback_Pendiente"]),
            "Indice_vegetacion(NDVI)": float(row["Fallback_NDVI"]),
            "Polvo/aerosoles": float(row["Polvo/aerosoles"]),
            "Azufres_Sulfatos": float(row["Fallback_Azufres_Sulfatos"]),
        }
        rows.append({
            "Sitio": row["Sitio"], "Pais_Region": row["Pais_Region"],
            "Tipo_Entorno": row["Tipo_Entorno"], "Tipo": "CANDIDATO_TIERRA",
            "Latitud": float(row["Latitud"]), "Longitud": float(row["Longitud"]),
            **values, "Imagen_URL": row["Imagen_URL"],
            "Referencias": "Curated Earth analogue; " + REFERENCE,
        })
    return pd.DataFrame(rows)


def _seed_rows(points: list[tuple[float, float]]) -> pd.DataFrame:
    names = _reverse_names(points)
    rows = []
    for (lat, lon), (name, country) in zip(points, names):
        values = _proxy_values(lat, lon)
        if values["Indice_vegetacion(NDVI)"] > 0.18:
            continue
        rows.append({
            "Sitio": f"{name} analogue",
            "Pais_Region": country,
            "Tipo_Entorno": "Arid or polar land proxy",
            "Tipo": "CANDIDATO_TIERRA",
            "Latitud": lat, "Longitud": lon, **values,
            "Imagen_URL": "",
            "Referencias": REFERENCE,
        })
    return pd.DataFrame(rows)


def _live_sample(point: tuple[float, float]) -> dict[str, float]:
    """Sample one point; every exception is handled by the caller."""
    import planetary_computer as pc
    import rasterio
    from pystac_client import Client

    lat, lon = point
    catalog = Client.open("https://planetarycomputer.microsoft.com/api/stac/v1", modifier=pc.sign_inplace)
    result: dict[str, float] = {}
    dem_search = catalog.search(
        collections=["nasadem"],
        intersects={"type": "Point", "coordinates": [lon, lat]},
        max_items=1,
    )
    dem_item = next(iter(dem_search.items()), None)
    if dem_item:
        asset = next(iter(dem_item.assets.values()))
        with rasterio.open(asset.href) as src:
            row, col = src.index(lon, lat)
            window = rasterio.windows.Window(max(0, col - 2), max(0, row - 2), 5, 5)
            elevation = src.read(1, window=window, masked=True).astype(float)
            if elevation.count() > 4:
                gy, gx = np.gradient(elevation.filled(np.nan))
                pixel_x, pixel_y = abs(src.res[0]), abs(src.res[1])
                gradient = np.hypot(gx / max(pixel_x, 1), gy / max(pixel_y, 1))
                result["Pendiente°"] = float(np.degrees(np.arctan(np.nanmean(gradient))))
    search = catalog.search(collections=["modis-11A1-061"], intersects={"type": "Point", "coordinates": [lon, lat]}, max_items=1)
    item = next(iter(search.items()), None)
    if item:
        for asset_name, output in (("LST_Day_1km", "Temp_Max(C°)"), ("LST_Night_1km", "Temp_Min(C°)")):
            if asset_name in item.assets:
                with rasterio.open(item.assets[asset_name].href) as src:
                    row, col = src.index(lon, lat)
                    value = float(src.read(1, window=rasterio.windows.Window(col, row, 1, 1))[0, 0])
                    if np.isfinite(value):
                        result[output] = value * 0.02 - 273.15
    search = catalog.search(collections=["landsat-c2-l2"], intersects={"type": "Point", "coordinates": [lon, lat]}, max_items=1)
    item = next(iter(search.items()), None)
    if item:
        samples = {}
        for band in ("red", "nir08", "swir16", "swir22"):
            if band not in item.assets:
                continue
            with rasterio.open(item.assets[band].href) as src:
                row, col = src.index(lon, lat)
                value = float(src.read(1, window=rasterio.windows.Window(col, row, 1, 1))[0, 0])
                if np.isfinite(value):
                    samples[band] = value
        if samples.get("red") is not None and samples.get("nir08") is not None:
            total = samples["red"] + samples["nir08"]
            if total:
                result["Indice_vegetacion(NDVI)"] = (samples["nir08"] - samples["red"]) / total
        if samples.get("swir22"):
            result["Azufres_Sulfatos"] = samples.get("swir16", 0) / samples["swir22"]
    return result


def _enrich_live(df: pd.DataFrame, workers: int) -> pd.DataFrame:
    points = list(zip(df["Latitud"], df["Longitud"]))
    updates: dict[int, dict[str, float]] = {}
    with ThreadPoolExecutor(max_workers=workers) as executor:
        futures = {executor.submit(_live_sample, point): index for index, point in enumerate(points)}
        for future in tqdm(as_completed(futures), total=len(futures), desc="Planetary Computer"):
            index = futures[future]
            try:
                updates[index] = future.result()
            except Exception:
                updates[index] = {}
    for index, values in updates.items():
        for key, value in values.items():
            if math.isfinite(value):
                df.loc[index, key] = value
    # Keep curated records, but discard live/grid points that are not useful
    # dryland analogues after the remotely sampled NDVI is available.
    df = df[df["_curated"] | (df["Indice_vegetacion(NDVI)"] <= 0.18)]
    return df


def build(args: argparse.Namespace) -> pd.DataFrame:
    points = _grid(args.step)
    if args.max_points:
        points = points[: args.max_points]
    generated = _seed_rows(points)
    curated = _curated()
    curated["_curated"] = True
    generated["_curated"] = False
    generated = pd.concat([curated, generated], ignore_index=True)
    generated = generated.drop_duplicates(subset=["Latitud", "Longitud"], keep="first")
    if args.live_api:
        generated = _enrich_live(generated, args.workers)
    generated["Amplitud_termica_(Delta_T)"] = generated["Temp_Max(C°)"] - generated["Temp_Min(C°)"]
    generated[NUMERIC] = generated[NUMERIC].apply(pd.to_numeric, errors="coerce")
    generated[NUMERIC] = generated[NUMERIC].replace([np.inf, -np.inf], np.nan).fillna(0)
    generated["Pais_Region"] = generated["Pais_Region"].fillna("Earth")
    generated["Imagen_URL"] = generated["Imagen_URL"].fillna("")
    columns = [
        "Sitio", "Pais_Region", "Tipo_Entorno", "Tipo", "Latitud", "Longitud",
        *NUMERIC, "Imagen_URL", "Referencias",
    ]
    return generated[columns]


def main() -> None:
    parser = argparse.ArgumentParser(description="Genera una grilla terrestre filtrada para NASA Analog Finder")
    parser.add_argument("--step", type=float, default=2.5, help="Paso de la grilla en grados")
    parser.add_argument("--fast-seed", action="store_true", help="Usa proxies deterministas sin consultas remotas")
    parser.add_argument("--live-api", action="store_true", help="Enriquece puntos con Planetary Computer")
    parser.add_argument("--max-points", type=int, default=0, help="Limita puntos de grilla antes de enriquecer")
    parser.add_argument("--workers", type=int, default=8, help="Hilos para consultas live")
    args = parser.parse_args()
    if args.live_api and args.fast_seed:
        parser.error("--fast-seed y --live-api son modos alternativos")
    if not args.live_api and not args.fast_seed:
        args.fast_seed = True
    if args.step <= 0 or args.step > 20:
        parser.error("--step debe estar entre 0 y 20 grados")
    FRONTEND_DATA.mkdir(parents=True, exist_ok=True)
    result = build(args)
    result.to_csv(DATA / "tierra_masiva.csv", index=False, encoding="utf-8")
    result.to_json(FRONTEND_DATA / "tierra_procesada.json", orient="records", indent=2, force_ascii=False)
    print(f"Generados {len(result)} registros en data/tierra_masiva.csv y frontend/data/tierra_procesada.json")


if __name__ == "__main__":
    main()
