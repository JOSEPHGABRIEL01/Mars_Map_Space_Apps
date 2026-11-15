"""Unified NASA Analog Finder data collector.

``--modo rapido`` is deterministic and uses the validated project values plus
calibrated physical proxies for new points.  ``--modo live`` additionally
attempts official USGS DEM samples for the Moon/Mars and parallel Planetary
Computer samples for Earth; every failed observation keeps its calibrated
fallback.  The live mode is intentionally best effort because the public DEM
files are very large and remote catalogue assets can be unavailable.
"""
from __future__ import annotations

import argparse
import json
import math
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
import requests
from global_land_mask import globe
from tqdm import tqdm

from automatizar_tierra import _enrich_live, _proxy_values, _reverse_names

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
FRONTEND_DATA = ROOT / "frontend" / "data"
CACHE = DATA / "cache"
SPACE_COLUMNS = [
    "Sitio", "Tipo", "Cuerpo", "Latitud", "Longitud", "Temp_Max(C°)",
    "Temp_Min(C°)", "Amplitud_termica_(Delta_T)", "Pendiente°",
    "Indice_vegetacion(NDVI)", "Polvo/aerosoles", "Azufres_Sulfatos", "Referencias",
]
EARTH_COLUMNS = [
    "Sitio", "Pais_Region", "Tipo_Entorno", "Tipo", "Latitud", "Longitud",
    "Temp_Max(C°)", "Temp_Min(C°)", "Amplitud_termica_(Delta_T)", "Pendiente°",
    "Indice_vegetacion(NDVI)", "Polvo/aerosoles", "Azufres_Sulfatos", "Imagen_URL", "Referencias",
]
LUNAR_DEM_URL = "https://planetarymaps.usgs.gov/mosaic/Lunar_LRO_LOLA_Global_LDEM_118m_Mar2014.tif"
MARTIAN_DEM_URL = "https://planetarymaps.usgs.gov/mosaic/Mars_MGS_MOLA_DEM_mosaic_global_463m.tif"
SPACE_REFERENCE = "NASA LRO LOLA / MGS MOLA / LRO Diviner / USGS Astrogeology"
PROVENANCE_COLUMNS = [
    "Cuerpo", "Sitio", "Latitud", "Longitud", "Parametro", "Valor_Utilizado", "Unidad",
    "Fuente", "Producto", "URL_Fuente", "Metodo", "Modo", "Es_Fallback", "Tipo_Dato",
    "Fecha_Consulta", "Observaciones",
]


def _space_point(name: str, body: str, lat: float, lon: float, tmax: float, tmin: float,
                 slope: float, dust: float, sulfate: float, environment: str) -> dict[str, Any]:
    return {
        "Sitio": name, "Tipo": "OBJETO", "Cuerpo": body, "Latitud": lat, "Longitud": lon,
        "Temp_Max(C°)": tmax, "Temp_Min(C°)": tmin, "Amplitud_termica_(Delta_T)": tmax - tmin,
        "Pendiente°": slope, "Indice_vegetacion(NDVI)": 0.0, "Polvo/aerosoles": dust,
        "Azufres_Sulfatos": sulfate, "Referencias": f"{SPACE_REFERENCE}; {environment}",
    }


def collect_moon() -> pd.DataFrame:
    sites = [
        ("South Pole", -89.9, 0.0, -23, -183, 10.84, 0.0, 0.0),
        ("Marius hills", 14.1, -56.8, 110, -170, 0.65, 0.0, 0.0),
        ("Shackleton Crater Rim (Artemis Candidate)", -89.54, 129.78, -18, -190, 12.2, 0.15, 0.15),
        ("Connecting Ridge (Shackleton-de Gerlache)", -89.45, -137.40, -25, -185, 8.6, 0.1, 0.1),
        ("Nobile Rim 1 (Artemis Candidate)", -85.20, 53.50, -20, -175, 9.4, 0.12, 0.12),
        ("Malapert Massif (Artemis Candidate)", -86.00, 0.00, -16, -170, 14.0, 0.08, 0.08),
        ("Haworth Crater Floor (PSR - Hielo)", -87.45, -5.17, -30, -220, 4.8, 0.02, 0.05),
        ("Cabeus Crater (LCROSS Impact Site)", -84.90, -35.50, -28, -210, 7.3, 0.04, 0.1),
        ("Aristarchus Plateau", 23.70, -47.40, 105, -165, 6.7, 0.0, 0.25),
        ("Mare Tranquillitatis Pit", 8.33, 33.22, 95, -160, 1.8, 0.0, 0.2),
        ("Mare Tranquillitatis (Apollo 11)", 0.67, 23.47, 105, -170, 0.9, 0.0, 0.2),
        ("Oceanus Procellarum (Apollo 12)", -3.01, -23.42, 100, -168, 1.2, 0.0, 0.22),
        ("Fra Mauro Highlands (Apollo 14)", -3.64, -17.47, 92, -165, 3.4, 0.0, 0.12),
        ("Hadley-Apennine (Apollo 15)", 26.13, 3.63, 115, -155, 11.6, 0.0, 0.18),
        ("Descartes Highlands (Apollo 16)", -8.97, 15.50, 90, -160, 5.2, 0.0, 0.05),
        ("Taurus-Littrow Valley (Apollo 17)", 20.19, 30.77, 108, -158, 7.1, 0.0, 0.2),
        ("Tycho Crater Central Peak", -43.31, -11.36, 80, -150, 18.0, 0.0, 0.08),
        ("Copernicus Crater Floor", 9.62, -20.08, 98, -165, 8.4, 0.0, 0.1),
        ("Von Karman Crater (Farside)", -44.45, 176.30, 75, -155, 3.8, 0.0, 0.08),
        ("Peary Crater Rim (North Pole)", 88.60, 33.00, -25, -185, 10.5, 0.0, 0.08),
    ]
    rows = [
        _space_point(name, "Luna", lat, lon, tmax, tmin, slope, dust, sulfate, "USGS Gazetteer / NASA LRO Diviner")
        for name, lat, lon, tmax, tmin, slope, dust, sulfate in sites
    ]
    return pd.DataFrame(rows, columns=SPACE_COLUMNS)


def collect_mars() -> pd.DataFrame:
    sites = [
        _space_point("Crater Jezero", "Marte", 18.38, 77.58, -20, -80, 0.85, 0.55, 1.45, "MGS MOLA / Perseverance MEDA"),
        _space_point("Crater Gale", "Marte", -5.4, 137.8, -10, -75, 5.65, 0.75, 1.75, "MGS MOLA / Curiosity REMS"),
    ]
    extra = [
        ("Elysium Planitia (InSight)", 4.5, 135.6, -8, -78, 1.1, .35, .9),
        ("Gusev Crater (Spirit)", -14.6, 175.5, -12, -82, 2.8, .5, 1.1),
        ("Meridiani Planum (Opportunity)", -1.95, -354.5, -15, -85, 1.2, .65, 1.4),
        ("Chryse Planitia (Viking 1)", 22.5, -47.9, -18, -88, .8, .45, .8),
        ("Utopia Planitia (Viking 2)", 47.97, 134.25, -25, -100, 1.4, .4, .7),
        ("Vastitas Borealis (Phoenix)", 68.2, 234.3, -30, -110, .7, .3, .65),
        ("Arcadia Planitia", 46.7, 197.4, -22, -96, 1.0, .35, .75),
        ("Hellas Planitia", -42.7, 70.0, -5, -75, 1.8, .8, 1.7),
        ("Valles Marineris (Coprates Chasma)", -14.0, -60.0, 5, -70, 18.0, .85, 1.9),
        ("Olympus Mons", 18.65, -133.8, -25, -95, 4.5, .25, .6),
        ("Arsia Mons (Skylights)", -9.0, -120.5, -18, -84, 7.5, .45, 1.0),
        ("Mawrth Vallis", 22.3, -343.5, -12, -82, 3.2, .5, 1.8),
        ("Oxia Planum", 18.3, -335.4, -14, -80, 2.1, .55, 1.6),
        ("Nili Fossae", 21.0, 76.0, -8, -78, 5.8, .65, 1.95),
        ("Syrtis Major Planum", 8.4, 69.5, -8, -72, 2.8, .7, 1.2),
        ("Noctis Labyrinthus", -7.0, -102.0, 0, -70, 12.0, .75, 1.65),
        ("Eberswalde Crater", -23.3, 326.7, -5, -72, 3.5, .55, 1.5),
        ("Holden Crater", -26.4, 326.0, -2, -74, 4.2, .6, 1.7),
        ("Ares Vallis (Pathfinder)", 19.1, -33.2, -13, -83, 2.4, .5, 1.1),
        ("Planum Boreum (Casquete Polar Norte)", 85.0, 0.0, -35, -115, 2.0, .2, .6),
    ]
    sites.extend(_space_point(name, "Marte", lat, lon, tmax, tmin, slope, dust, sulfate, "USGS Gazetteer / NASA MOLA / CRISM") for name, lat, lon, tmax, tmin, slope, dust, sulfate in extra)
    return pd.DataFrame(sites, columns=SPACE_COLUMNS)


def _download_dem(url: str, filename: str) -> Path | None:
    CACHE.mkdir(parents=True, exist_ok=True)
    destination = CACHE / filename
    if destination.exists():
        return destination
    try:
        with requests.get(url, stream=True, timeout=(15, 120)) as response:
            response.raise_for_status()
            with destination.open("wb") as handle:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        handle.write(chunk)
        return destination
    except requests.RequestException:
        destination.unlink(missing_ok=True)
        return None


def _dem_slopes(df: pd.DataFrame, dem_path: Path | None) -> pd.DataFrame:
    if dem_path is None:
        return df
    try:
        import rasterio
        from rasterio.errors import RasterioIOError
        with rasterio.open(dem_path) as source:
            for index, row in df.iterrows():
                try:
                    pixel_row, pixel_col = source.index(row.Longitud, row.Latitud)
                    window = rasterio.windows.Window(max(0, pixel_col - 2), max(0, pixel_row - 2), 5, 5)
                    values = source.read(1, window=window, masked=True).astype(float)
                    if values.count() > 4:
                        gy, gx = np.gradient(values.filled(np.nan))
                        scale_x, scale_y = max(abs(source.res[0]), 1), max(abs(source.res[1]), 1)
                        df.loc[index, "Pendiente°"] = np.degrees(np.arctan(np.nanmean(np.hypot(gx / scale_x, gy / scale_y))))
                except (IndexError, ValueError, RasterioIOError):
                    continue
    except (ImportError, OSError):
        return df
    return df


def collect_earth(mode: str, step: float = 3.0) -> pd.DataFrame:
    from automatizar_tierra import _curated, _seed_rows, _grid

    latitudes = np.arange(-78, 78.0001, step)
    longitudes = np.arange(-180, 180.0001, step)
    points = [(round(float(lat), 5), round(float(lon), 5)) for lat in latitudes for lon in longitudes]
    points = [(lat, lon) for lat, lon in points if bool(globe.is_land(lat, lon))]
    generated = _seed_rows(points)
    curated = _curated()
    curated["_curated"] = True
    generated["_curated"] = False
    result = pd.concat([curated, generated], ignore_index=True).drop_duplicates(["Latitud", "Longitud"])
    if mode == "live":
        result = _enrich_live(result, workers=8)
    result["Amplitud_termica_(Delta_T)"] = result["Temp_Max(C°)"] - result["Temp_Min(C°)"]
    result = result[result["_curated"] | (result["Indice_vegetacion(NDVI)"] <= 0.18)]
    result["Pais_Region"] = result["Pais_Region"].fillna("Earth")
    result["Imagen_URL"] = result["Imagen_URL"].fillna("")
    result = result[EARTH_COLUMNS]
    result[EARTH_COLUMNS[4:13]] = result[EARTH_COLUMNS[4:13]].apply(pd.to_numeric, errors="coerce").fillna(0)
    return result


def collect_all(mode: str) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    moon = collect_moon()
    mars = collect_mars()
    if mode == "live":
        moon = _dem_slopes(moon, _download_dem(LUNAR_DEM_URL, "lunar_lola_global.tif"))
        mars = _dem_slopes(mars, _download_dem(MARTIAN_DEM_URL, "martian_mola_global.tif"))
    earth = collect_earth(mode)
    for frame in (moon, mars):
        frame["Amplitud_termica_(Delta_T)"] = frame["Temp_Max(C°)"] - frame["Temp_Min(C°)"]
        frame[SPACE_COLUMNS[5:12]] = frame[SPACE_COLUMNS[5:12]].apply(pd.to_numeric, errors="coerce").fillna(0)
    return moon[SPACE_COLUMNS], mars[SPACE_COLUMNS], earth


def build_space_provenance(moon: pd.DataFrame, mars: pd.DataFrame, mode: str) -> pd.DataFrame:
    """Create one auditable provenance row for every target parameter."""
    import datetime as dt

    sources = {
        "Latitud": ("USGS", "Gazetteer of Planetary Nomenclature", "https://planetarynames.wr.usgs.gov/", "Coordenada oficial del sitio", "grados"),
        "Longitud": ("USGS", "Gazetteer of Planetary Nomenclature", "https://planetarynames.wr.usgs.gov/", "Coordenada oficial del sitio", "grados"),
        "Temp_Max(C°)": ("NASA", "LRO Diviner / MGS TES / THEMIS", "https://ode.rsl.wustl.edu/", "Valor validado o calibrado por región", "°C"),
        "Temp_Min(C°)": ("NASA", "LRO Diviner / MGS TES / THEMIS", "https://ode.rsl.wustl.edu/", "Valor validado o calibrado por región", "°C"),
        "Amplitud_termica_(Delta_T)": ("NASA Analog Finder", "Temperaturas máxima y mínima", "internal://nasa-analog-finder/calculado", "Calculado como Temp_Max - Temp_Min", "°C"),
        "Pendiente°": ("NASA / USGS", "LOLA DEM / MOLA DEM", "https://planetarymaps.usgs.gov/", "Muestreo DEM en modo live o valor calibrado en modo rapido", "grados"),
        "Indice_vegetacion(NDVI)": ("NASA", "LRO / MRO CRISM", "https://ode.rsl.wustl.edu/", "Cero físico para superficies sin vegetación", "NDVI"),
        "Polvo/aerosoles": ("NASA", "THEMIS / climatología marciana o Diviner", "https://ode.rsl.wustl.edu/", "Medición, climatología o proxy regional", "AOD"),
        "Azufres_Sulfatos": ("NASA", "Moon Mineralogy Mapper M3 / MRO CRISM", "https://ode.rsl.wustl.edu/", "Índice mineralógico calibrado", "índice"),
    }
    original_validated = {"South Pole", "Marius hills", "Crater Jezero", "Crater Gale"}
    records: list[dict[str, Any]] = []
    execution_date = dt.datetime.now(dt.timezone.utc).isoformat()
    for frame in (moon, mars):
        for _, site in frame.iterrows():
            for parameter, (source, product, url, method, unit) in sources.items():
                if parameter not in site:
                    continue
                is_delta = parameter == "Amplitud_termica_(Delta_T)"
                validated = site["Sitio"] in original_validated
                data_type = "validado" if validated else "calibrado"
                if is_delta:
                    data_type = "calculado"
                if parameter == "Indice_vegetacion(NDVI)":
                    data_type = "constante_fisica"
                fallback = mode == "rapido" and not validated
                records.append({
                    "Cuerpo": site["Cuerpo"], "Sitio": site["Sitio"],
                    "Latitud": site["Latitud"], "Longitud": site["Longitud"],
                    "Parametro": parameter, "Valor_Utilizado": site[parameter], "Unidad": unit,
                    "Fuente": source, "Producto": product, "URL_Fuente": url,
                    "Metodo": method, "Modo": mode, "Es_Fallback": fallback,
                    "Tipo_Dato": data_type, "Fecha_Consulta": execution_date,
                    "Observaciones": "Valor original validado" if validated else "Valor calibrado/proxy; revisar contra consulta live",
                })
    return pd.DataFrame(records, columns=PROVENANCE_COLUMNS)


def update_frontend_fallback(moon: pd.DataFrame, mars: pd.DataFrame, earth: pd.DataFrame) -> None:
    """Keep the file:// fallback synchronized with the generated datasets."""
    app_path = ROOT / "frontend" / "app.js"
    source = app_path.read_text(encoding="utf-8")
    start_marker = "/* GENERATED_FALLBACK_START */"
    end_marker = "/* GENERATED_FALLBACK_END */"
    start = source.find(start_marker)
    end = source.find(end_marker)
    if start < 0 or end < start:
        raise RuntimeError("app.js no contiene los marcadores de fallback generados")
    targets = pd.concat([moon, mars], ignore_index=True).to_dict(orient="records")
    earth_records = earth.to_dict(orient="records")
    generated = (
        f"{start_marker}\n"
        f"const FALLBACK_TARGETS = {json.dumps(targets, ensure_ascii=False, indent=2)};\n"
        f"const FALLBACK_EARTH = {json.dumps(earth_records, ensure_ascii=False, indent=2)};\n"
        f"{end_marker}"
    )
    app_path.write_text(source[:start] + generated + source[end + len(end_marker):], encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Recolector unificado NASA Analog Finder")
    parser.add_argument("--modo", choices=("rapido", "live"), default="rapido")
    args = parser.parse_args()
    DATA.mkdir(exist_ok=True)
    FRONTEND_DATA.mkdir(parents=True, exist_ok=True)
    moon, mars, earth = collect_all(args.modo)
    moon.to_csv(DATA / "luna_automatizada.csv", index=False, encoding="utf-8")
    mars.to_csv(DATA / "marte_automatizado.csv", index=False, encoding="utf-8")
    earth.to_csv(DATA / "tierra_automatizada.csv", index=False, encoding="utf-8")
    pd.concat([moon, mars], ignore_index=True).to_json(FRONTEND_DATA / "objetivos_espaciales.json", orient="records", indent=2, force_ascii=False)
    earth.to_json(FRONTEND_DATA / "tierra_procesada.json", orient="records", indent=2, force_ascii=False)
    provenance = build_space_provenance(moon, mars, args.modo)
    provenance.to_csv(DATA / "procedencia_objetivos_espaciales.csv", index=False, encoding="utf-8")
    update_frontend_fallback(moon, mars, earth)
    print(f"Luna: {len(moon)} sitios | Marte: {len(mars)} sitios | Tierra: {len(earth)} sitios")
    print(f"Exportados: {DATA / 'luna_automatizada.csv'}, {DATA / 'marte_automatizado.csv'}, {DATA / 'tierra_automatizada.csv'}")
    print(f"Frontend: {FRONTEND_DATA / 'objetivos_espaciales.json'} y {FRONTEND_DATA / 'tierra_procesada.json'}")
    print(f"Procedencia: {DATA / 'procedencia_objetivos_espaciales.csv'} ({len(provenance)} filas)")


if __name__ == "__main__":
    main()
