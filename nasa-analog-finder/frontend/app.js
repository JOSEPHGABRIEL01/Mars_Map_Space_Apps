const ENVIROMAP = [
  ["Campo volcanico", "Volcanic field"],
  ["crateres", "craters"],
  ["Desierto", "Desert"],
  ["desierto", "desert"],
  ["hiperarido", "hyperarid"],
  ["Cuenca", "Basin"],
  ["cuencas", "basins"],
  ["evaporitica", "evaporitic"],
  ["volcanico", "volcanic"],
  ["basalticas", "basaltic"],
  ["basalticos", "basaltic"],
  ["impacto", "impact"],
  ["rico en", "rich in"],
  [" y ", " and "],
];
function englishEnvironment(text) {
  let value = String(text || "");
  ENVIROMAP.forEach(([from, to]) => (value = value.replaceAll(from, to)));
  return value;
}
const PARAMS = {
  "Temp_Max(C°)": {
    label: "Maximum temperature",
    unit: "°C",
    scale: 25,
    weight: 1.2,
  },
  "Temp_Min(C°)": {
    label: "Minimum temperature",
    unit: "°C",
    scale: 30,
    weight: 1.2,
  },
  "Amplitud_termica_(Delta_T)": {
    label: "Thermal range",
    unit: "°C",
    scale: 40,
    weight: 1.3,
  },
  "Pendiente°": { label: "Slope", unit: "°", scale: 5, weight: 1 },
  "Indice_vegetacion(NDVI)": {
    label: "Vegetation index",
    unit: "NDVI",
    scale: 0.15,
    weight: 0.8,
  },
  "Polvo/aerosoles": {
    label: "Dust / aerosol",
    unit: "AOD",
    scale: 0.2,
    weight: 1,
  },
  Azufres_Sulfatos: {
    label: "Sulfate index",
    unit: "Index",
    scale: 0.25,
    weight: 1.3,
  },
};
const FALLBACK_TARGETS = [
    {
      Sitio: "South Pole",
      Tipo: "OBJETO",
      Cuerpo: "Luna",
      Latitud: -89.9,
      Longitud: 0.0,
      "Temp_Max(C°)": -23,
      "Temp_Min(C°)": -183,
      "Amplitud_termica_(Delta_T)": 160,
      "Pendiente°": 10.84,
      "Indice_vegetacion(NDVI)": 0,
      "Polvo/aerosoles": 0.0,
      Azufres_Sulfatos: 0.0,
      Referencias: "NASA LRO LOLA DEM (87.5 deg v4 S Pole) / LRO Diviner Lunar Radiometer",
    },
    {
      Sitio: "Marius hills",
      Tipo: "OBJETO",
      Cuerpo: "Luna",
      Latitud: 14.1,
      Longitud: -56.8,
      "Temp_Max(C°)": 110,
      "Temp_Min(C°)": -170,
      "Amplitud_termica_(Delta_T)": 280,
      "Pendiente°": 0.65,
      "Indice_vegetacion(NDVI)": 0,
      "Polvo/aerosoles": 0.0,
      Azufres_Sulfatos: 0.0,
      Referencias: "NASA LRO LOLA DEM / LRO Diviner Lunar Radiometer",
    },
    {
      Sitio: "Crater Jezero",
      Tipo: "OBJETO",
      Cuerpo: "Marte",
      Latitud: 18.38,
      Longitud: 77.58,
      "Temp_Max(C°)": -20,
      "Temp_Min(C°)": -80,
      "Amplitud_termica_(Delta_T)": 60,
      "Pendiente°": 0.85,
      "Indice_vegetacion(NDVI)": 0,
      "Polvo/aerosoles": 0.55,
      Azufres_Sulfatos: 1.45,
      Referencias: "NASA MGS MOLA Global DEM / Mars 2020 Perseverance MEDA & Mastcam-Z",
    },
    {
      Sitio: "Crater Gale",
      Tipo: "OBJETO",
      Cuerpo: "Marte",
      Latitud: -5.4,
      Longitud: 137.8,
      "Temp_Max(C°)": -10,
      "Temp_Min(C°)": -75,
      "Amplitud_termica_(Delta_T)": 65,
      "Pendiente°": 5.65,
      "Indice_vegetacion(NDVI)": 0,
      "Polvo/aerosoles": 0.75,
      Azufres_Sulfatos: 1.75,
      Referencias: "NASA MGS MOLA Global DEM / MRO HiRISE / MSL Curiosity REMS",
    },
  ],
  FALLBACK_EARTH = [
    {
      Sitio: "El Pinacate y Gran Desierto de Altar",
      Pais_Region: "Mexico",
      Tipo_Entorno: "Campo volcanico y crateres maar",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 31.772,
      Longitud: -113.505,
      "Temp_Max(C°)": 46.0,
      "Temp_Min(C°)": 6.0,
      "Pendiente°": 8.5,
      "Indice_vegetacion(NDVI)": 0.06,
      Azufres_Sulfatos: 1.35,
      "Amplitud_termica_(Delta_T)": 40.0,
      "Polvo/aerosoles": 0.45,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Pinacate_peaks.jpg/640px-Pinacate_peaks.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Valles Secos de McMurdo",
      Pais_Region: "Antartida",
      Tipo_Entorno: "Desierto polar hiperarido",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -77.466,
      Longitud: 162.518,
      "Temp_Max(C°)": -5.0,
      "Temp_Min(C°)": -48.0,
      "Pendiente°": 11.2,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 0.85,
      "Amplitud_termica_(Delta_T)": 43.0,
      "Polvo/aerosoles": 0.02,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Wright_Valley_McMurdo_Dry_Valleys.jpg/640px-Wright_Valley_McMurdo_Dry_Valleys.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Desierto de Atacama (Valle de la Luna)",
      Pais_Region: "Chile",
      Tipo_Entorno: "Desierto hiperarido y cuencas salinas",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -22.911,
      Longitud: -68.323,
      "Temp_Max(C°)": 32.0,
      "Temp_Min(C°)": -8.0,
      "Pendiente°": 6.4,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 1.65,
      "Amplitud_termica_(Delta_T)": 40.0,
      "Polvo/aerosoles": 0.32,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Valle_de_la_Luna_-_Atacama_Desert.jpg/640px-Valle_de_la_Luna_-_Atacama_Desert.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Salar de Uyuni",
      Pais_Region: "Bolivia",
      Tipo_Entorno: "Planicie evaporitica de sulfatos y litio",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -20.133,
      Longitud: -67.489,
      "Temp_Max(C°)": 21.0,
      "Temp_Min(C°)": -12.0,
      "Pendiente°": 0.3,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.72,
      "Amplitud_termica_(Delta_T)": 33.0,
      "Polvo/aerosoles": 0.18,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Salar_de_Uyuni_Diciembre_2007_-_Panorama_1.jpg/640px-Salar_de_Uyuni_Diciembre_2007_-_Panorama_1.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater de Impacto Haughton (Isla Devon)",
      Pais_Region: "Canada",
      Tipo_Entorno: "Crater de impacto polar en permafrost",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 75.383,
      Longitud: -89.666,
      "Temp_Max(C°)": 5.0,
      "Temp_Min(C°)": -42.0,
      "Pendiente°": 9.8,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 1.1,
      "Amplitud_termica_(Delta_T)": 47.0,
      "Polvo/aerosoles": 0.03,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Haughton_impact_crater_radar.jpg/640px-Haughton_impact_crater_radar.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Craters of the Moon",
      Pais_Region: "Estados Unidos",
      Tipo_Entorno: "Flujos basalticos y tubos de lava",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 43.416,
      Longitud: -113.516,
      "Temp_Max(C°)": 34.0,
      "Temp_Min(C°)": -14.0,
      "Pendiente°": 2.1,
      "Indice_vegetacion(NDVI)": 0.08,
      Azufres_Sulfatos: 0.45,
      "Amplitud_termica_(Delta_T)": 48.0,
      "Polvo/aerosoles": 0.15,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Craters_of_the_Moon_National_Monument.jpg/640px-Craters_of_the_Moon_National_Monument.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Desierto de Lut (Dasht-e Lut)",
      Pais_Region: "Iran",
      Tipo_Entorno: "Cuenca eolica extrema y yardangs",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 30.566,
      Longitud: 59.133,
      "Temp_Max(C°)": 65.0,
      "Temp_Min(C°)": 12.0,
      "Pendiente°": 1.4,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.48,
      "Amplitud_termica_(Delta_T)": 53.0,
      "Polvo/aerosoles": 0.78,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Dasht-e_Lut_Iran.jpg/640px-Dasht-e_Lut_Iran.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Volcan Dallol (Depresion de Danakil)",
      Pais_Region: "Etiopia",
      Tipo_Entorno: "Sistema hidrotermal acido y sulfatos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 14.241,
      Longitud: 40.299,
      "Temp_Max(C°)": 52.0,
      "Temp_Min(C°)": 26.0,
      "Pendiente°": 1.8,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.95,
      "Amplitud_termica_(Delta_T)": 26.0,
      "Polvo/aerosoles": 0.68,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Dallol_Ethiopia.jpg/640px-Dallol_Ethiopia.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Rio Tinto",
      Pais_Region: "Espana",
      Tipo_Entorno: "Ambiente acido extremo rico en hierro y azufre",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 37.702,
      Longitud: -6.559,
      "Temp_Max(C°)": 36.0,
      "Temp_Min(C°)": 4.0,
      "Pendiente°": 7.5,
      "Indice_vegetacion(NDVI)": 0.12,
      Azufres_Sulfatos: 1.88,
      "Amplitud_termica_(Delta_T)": 32.0,
      "Polvo/aerosoles": 0.22,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Rio_tinto_2.jpg/640px-Rio_tinto_2.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Mauna Loa",
      Pais_Region: "Estados Unidos (Hawai)",
      Tipo_Entorno: "Volcan en escudo basaltico y tubos de lava",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 19.475,
      Longitud: -155.608,
      "Temp_Max(C°)": 18.0,
      "Temp_Min(C°)": -6.0,
      "Pendiente°": 12.4,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 0.55,
      "Amplitud_termica_(Delta_T)": 24.0,
      "Polvo/aerosoles": 0.08,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Mauna_Loa_Volcano.jpg/640px-Mauna_Loa_Volcano.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Tierras Altas de Askja y Holuhraun",
      Pais_Region: "Islandia",
      Tipo_Entorno: "Planicie volcanica subpolar y fisuras basalticas",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 65.033,
      Longitud: -16.75,
      "Temp_Max(C°)": 12.0,
      "Temp_Min(C°)": -25.0,
      "Pendiente°": 4.2,
      "Indice_vegetacion(NDVI)": 0.03,
      Azufres_Sulfatos: 0.7,
      "Amplitud_termica_(Delta_T)": 37.0,
      "Polvo/aerosoles": 0.12,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Askja_Caldera.jpg/640px-Askja_Caldera.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Barringer (Meteor Crater)",
      Pais_Region: "Estados Unidos",
      Tipo_Entorno: "Crater de impacto preservado en desierto",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 35.027,
      Longitud: -111.022,
      "Temp_Max(C°)": 38.0,
      "Temp_Min(C°)": -9.0,
      "Pendiente°": 18.5,
      "Indice_vegetacion(NDVI)": 0.05,
      Azufres_Sulfatos: 0.95,
      "Amplitud_termica_(Delta_T)": 47.0,
      "Polvo/aerosoles": 0.28,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Meteor_Crater_-_Arizona.jpg/640px-Meteor_Crater_-_Arizona.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Lonar",
      Pais_Region: "India",
      Tipo_Entorno: "Crater de impacto en trampa basaltica",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 19.976,
      Longitud: 76.508,
      "Temp_Max(C°)": 40.0,
      "Temp_Min(C°)": 14.0,
      "Pendiente°": 14.2,
      "Indice_vegetacion(NDVI)": 0.14,
      Azufres_Sulfatos: 1.2,
      "Amplitud_termica_(Delta_T)": 26.0,
      "Polvo/aerosoles": 0.42,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Lonar_Crater_Lake.jpg/640px-Lonar_Crater_Lake.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Pingualuit",
      Pais_Region: "Canada",
      Tipo_Entorno: "Crater de impacto subartico",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 61.276,
      Longitud: -73.66,
      "Temp_Max(C°)": 8.0,
      "Temp_Min(C°)": -38.0,
      "Pendiente°": 16.1,
      "Indice_vegetacion(NDVI)": 0.03,
      Azufres_Sulfatos: 0.4,
      "Amplitud_termica_(Delta_T)": 46.0,
      "Polvo/aerosoles": 0.04,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Pingualuit_crater.jpg/640px-Pingualuit_crater.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Wadi Rum",
      Pais_Region: "Jordania",
      Tipo_Entorno: "Valles de arenisca y oxidos de hierro",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 29.576,
      Longitud: 35.419,
      "Temp_Max(C°)": 42.0,
      "Temp_Min(C°)": 4.0,
      "Pendiente°": 9.2,
      "Indice_vegetacion(NDVI)": 0.03,
      Azufres_Sulfatos: 1.3,
      "Amplitud_termica_(Delta_T)": 38.0,
      "Polvo/aerosoles": 0.58,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Wadi_Rum_Desert.jpg/640px-Wadi_Rum_Desert.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Desierto del Namib (Sossusvlei)",
      Pais_Region: "Namibia",
      Tipo_Entorno: "Campo de megadunas eolicas hiperaridas",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -24.727,
      Longitud: 15.299,
      "Temp_Max(C°)": 44.0,
      "Temp_Min(C°)": 2.0,
      "Pendiente°": 6.8,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 1.15,
      "Amplitud_termica_(Delta_T)": 42.0,
      "Polvo/aerosoles": 0.48,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Namib_Desert_Dunes.jpg/640px-Namib_Desert_Dunes.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Meseta de Chajnantor",
      Pais_Region: "Chile",
      Tipo_Entorno: "Altiplano hiperarido de gran altitud",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -23.023,
      Longitud: -67.753,
      "Temp_Max(C°)": 10.0,
      "Temp_Min(C°)": -28.0,
      "Pendiente°": 5.1,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.4,
      "Amplitud_termica_(Delta_T)": 38.0,
      "Polvo/aerosoles": 0.1,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Chajnantor_Plateau.jpg/640px-Chajnantor_Plateau.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Volcan Etna (Valle del Bove)",
      Pais_Region: "Italia",
      Tipo_Entorno: "Estratovolcan basaltico y piroclastos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 37.751,
      Longitud: 14.993,
      "Temp_Max(C°)": 22.0,
      "Temp_Min(C°)": -12.0,
      "Pendiente°": 19.4,
      "Indice_vegetacion(NDVI)": 0.04,
      Azufres_Sulfatos: 1.6,
      "Amplitud_termica_(Delta_T)": 34.0,
      "Polvo/aerosoles": 0.35,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Mt_Etna_and_Catania1.jpg/640px-Mt_Etna_and_Catania1.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Caldera de Tenerife (Las Canadas del Teide)",
      Pais_Region: "Espana",
      Tipo_Entorno: "Caldera volcanica de alta montana",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 28.272,
      Longitud: -16.642,
      "Temp_Max(C°)": 24.0,
      "Temp_Min(C°)": -8.0,
      "Pendiente°": 14.8,
      "Indice_vegetacion(NDVI)": 0.05,
      Azufres_Sulfatos: 1.25,
      "Amplitud_termica_(Delta_T)": 32.0,
      "Polvo/aerosoles": 0.3,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Teide_Tenerife.jpg/640px-Teide_Tenerife.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Lanzarote (Parque Nacional de Timanfaya)",
      Pais_Region: "Espana",
      Tipo_Entorno: "Campos de lava basaltica y tubos volcanicos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 29.004,
      Longitud: -13.753,
      "Temp_Max(C°)": 32.0,
      "Temp_Min(C°)": 12.0,
      "Pendiente°": 5.6,
      "Indice_vegetacion(NDVI)": 0.03,
      Azufres_Sulfatos: 0.9,
      "Amplitud_termica_(Delta_T)": 20.0,
      "Polvo/aerosoles": 0.38,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Timanfaya_Lanzarote.jpg/640px-Timanfaya_Lanzarote.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Cuenca de Qaidam",
      Pais_Region: "China",
      Tipo_Entorno: "Playas de sulfatos y yardangs eolicos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 37.25,
      Longitud: 94.5,
      "Temp_Max(C°)": 30.0,
      "Temp_Min(C°)": -24.0,
      "Pendiente°": 1.2,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.8,
      "Amplitud_termica_(Delta_T)": 54.0,
      "Polvo/aerosoles": 0.72,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Qaidam_Basin.jpg/640px-Qaidam_Basin.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Depresion de Turpan",
      Pais_Region: "China",
      Tipo_Entorno: "Cuenca desertica extrema bajo el nivel del mar",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 42.78,
      Longitud: 89.34,
      "Temp_Max(C°)": 48.0,
      "Temp_Min(C°)": -16.0,
      "Pendiente°": 2.4,
      "Indice_vegetacion(NDVI)": 0.03,
      Azufres_Sulfatos: 1.42,
      "Amplitud_termica_(Delta_T)": 64.0,
      "Polvo/aerosoles": 0.65,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flaming_Mountains_Turpan.jpg/640px-Flaming_Mountains_Turpan.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Roter Kamm",
      Pais_Region: "Namibia",
      Tipo_Entorno: "Crater de impacto cubierto por dunas eolicas",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -27.766,
      Longitud: 16.283,
      "Temp_Max(C°)": 38.0,
      "Temp_Min(C°)": 3.0,
      "Pendiente°": 7.9,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 1.05,
      "Amplitud_termica_(Delta_T)": 35.0,
      "Polvo/aerosoles": 0.4,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Roter_Kamm_crater.jpg/640px-Roter_Kamm_crater.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Wolfe Creek",
      Pais_Region: "Australia",
      Tipo_Entorno: "Crater de impacto en desierto arido",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -19.171,
      Longitud: 127.795,
      "Temp_Max(C°)": 41.0,
      "Temp_Min(C°)": 8.0,
      "Pendiente°": 6.2,
      "Indice_vegetacion(NDVI)": 0.09,
      Azufres_Sulfatos: 1.18,
      "Amplitud_termica_(Delta_T)": 33.0,
      "Polvo/aerosoles": 0.36,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Wolfe_Creek_Crater.jpg/640px-Wolfe_Creek_Crater.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Región de Pilbara",
      Pais_Region: "Australia",
      Tipo_Entorno: "Terreno arcaico rico en oxidos de hierro y silice",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -21.45,
      Longitud: 119.5,
      "Temp_Max(C°)": 43.0,
      "Temp_Min(C°)": 10.0,
      "Pendiente°": 4.8,
      "Indice_vegetacion(NDVI)": 0.08,
      Azufres_Sulfatos: 1.52,
      "Amplitud_termica_(Delta_T)": 33.0,
      "Polvo/aerosoles": 0.34,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Karijini_National_Park.jpg/640px-Karijini_National_Park.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Amguid",
      Pais_Region: "Argelia",
      Tipo_Entorno: "Crater de impacto simple en el Sahara central",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 26.087,
      Longitud: 4.395,
      "Temp_Max(C°)": 46.0,
      "Temp_Min(C°)": 2.0,
      "Pendiente°": 11.4,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 0.95,
      "Amplitud_termica_(Delta_T)": 44.0,
      "Polvo/aerosoles": 0.76,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Amguid_crater.jpg/640px-Amguid_crater.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Tenoumer",
      Pais_Region: "Mauritania",
      Tipo_Entorno: "Crater de impacto circular en el Sahara",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 22.918,
      Longitud: -10.408,
      "Temp_Max(C°)": 45.0,
      "Temp_Min(C°)": 6.0,
      "Pendiente°": 8.7,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 0.88,
      "Amplitud_termica_(Delta_T)": 39.0,
      "Polvo/aerosoles": 0.74,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Tenoumer_crater.jpg/640px-Tenoumer_crater.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Estructura de Richat (Ojo del Sahara)",
      Pais_Region: "Mauritania",
      Tipo_Entorno: "Domo geologico erosionado con anillos concentricos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 21.124,
      Longitud: -11.402,
      "Temp_Max(C°)": 44.0,
      "Temp_Min(C°)": 7.0,
      "Pendiente°": 3.5,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.22,
      "Amplitud_termica_(Delta_T)": 37.0,
      "Polvo/aerosoles": 0.7,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Richat_Structure_ISS.jpg/640px-Richat_Structure_ISS.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Macizo de Tibesti (Caldera Emi Koussi)",
      Pais_Region: "Chad",
      Tipo_Entorno: "Volcan en escudo piroclastico en el Sahara",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 19.8,
      Longitud: 18.533,
      "Temp_Max(C°)": 35.0,
      "Temp_Min(C°)": -4.0,
      "Pendiente°": 13.6,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 1.38,
      "Amplitud_termica_(Delta_T)": 39.0,
      "Polvo/aerosoles": 0.66,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Emi_Koussi_ISS.jpg/640px-Emi_Koussi_ISS.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Campo Volcanico de Harrat Khaybar",
      Pais_Region: "Arabia Saudita",
      Tipo_Entorno: "Domos de lava tobas y tubos basalticos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 25.666,
      Longitud: 39.95,
      "Temp_Max(C°)": 45.0,
      "Temp_Min(C°)": 8.0,
      "Pendiente°": 4.9,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.12,
      "Amplitud_termica_(Delta_T)": 37.0,
      "Polvo/aerosoles": 0.62,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Harrat_Khaybar.jpg/640px-Harrat_Khaybar.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Al Wahbah",
      Pais_Region: "Arabia Saudita",
      Tipo_Entorno: "Crater maar volcanico con fondo de fosfatos y sales",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 22.901,
      Longitud: 41.139,
      "Temp_Max(C°)": 43.0,
      "Temp_Min(C°)": 6.0,
      "Pendiente°": 15.2,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 1.58,
      "Amplitud_termica_(Delta_T)": 37.0,
      "Polvo/aerosoles": 0.56,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Al_Wahbah_Crater.jpg/640px-Al_Wahbah_Crater.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Valle de la Muerte (Badwater Basin)",
      Pais_Region: "Estados Unidos",
      Tipo_Entorno: "Cuenca evaporitica hiperarida y abanicos aluviales",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 36.23,
      Longitud: -116.766,
      "Temp_Max(C°)": 51.0,
      "Temp_Min(C°)": 5.0,
      "Pendiente°": 3.2,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 1.62,
      "Amplitud_termica_(Delta_T)": 46.0,
      "Polvo/aerosoles": 0.32,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Badwater_Basin_Death_Valley.jpg/640px-Badwater_Basin_Death_Valley.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Desierto Pintado (Painted Desert)",
      Pais_Region: "Estados Unidos",
      Tipo_Entorno: "Estratos de arcillas esmectitas y oxidos de hierro",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 35.083,
      Longitud: -109.783,
      "Temp_Max(C°)": 36.0,
      "Temp_Min(C°)": -6.0,
      "Pendiente°": 4.5,
      "Indice_vegetacion(NDVI)": 0.05,
      Azufres_Sulfatos: 1.55,
      "Amplitud_termica_(Delta_T)": 42.0,
      "Polvo/aerosoles": 0.25,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Painted_Desert_Arizona.jpg/640px-Painted_Desert_Arizona.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "White Sands",
      Pais_Region: "Estados Unidos",
      Tipo_Entorno: "Campo de dunas de sulfato de calcio (yeso)",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 32.779,
      Longitud: -106.171,
      "Temp_Max(C°)": 38.0,
      "Temp_Min(C°)": -5.0,
      "Pendiente°": 1.9,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 1.92,
      "Amplitud_termica_(Delta_T)": 43.0,
      "Polvo/aerosoles": 0.29,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/White_Sands_New_Mexico.jpg/640px-White_Sands_New_Mexico.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Mono Lake",
      Pais_Region: "Estados Unidos",
      Tipo_Entorno: "Lago alcalino hipersalino con torres de carbonato",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 38.016,
      Longitud: -119.009,
      "Temp_Max(C°)": 31.0,
      "Temp_Min(C°)": -9.0,
      "Pendiente°": 3.8,
      "Indice_vegetacion(NDVI)": 0.06,
      Azufres_Sulfatos: 1.45,
      "Amplitud_termica_(Delta_T)": 40.0,
      "Polvo/aerosoles": 0.18,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Mono_Lake_Tufa.jpg/640px-Mono_Lake_Tufa.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Salar de Antofalla",
      Pais_Region: "Argentina",
      Tipo_Entorno: "Cuenca evaporitica andina y vulcanismo",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -25.55,
      Longitud: -67.6,
      "Temp_Max(C°)": 22.0,
      "Temp_Min(C°)": -18.0,
      "Pendiente°": 7.4,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.68,
      "Amplitud_termica_(Delta_T)": 40.0,
      "Polvo/aerosoles": 0.16,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Salar_de_Antofalla.jpg/640px-Salar_de_Antofalla.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Payunia (Malargue)",
      Pais_Region: "Argentina",
      Tipo_Entorno: "Campo volcanico con mas de 800 conos basalticos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -36.25,
      Longitud: -69.0,
      "Temp_Max(C°)": 28.0,
      "Temp_Min(C°)": -10.0,
      "Pendiente°": 6.7,
      "Indice_vegetacion(NDVI)": 0.04,
      Azufres_Sulfatos: 0.85,
      "Amplitud_termica_(Delta_T)": 38.0,
      "Polvo/aerosoles": 0.2,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Payunia_Volcanoes.jpg/640px-Payunia_Volcanoes.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Svalbard (Bockfjorden)",
      Pais_Region: "Noruega",
      Tipo_Entorno: "Centros volcanicos subpolares en permafrost",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 79.45,
      Longitud: 13.383,
      "Temp_Max(C°)": 4.0,
      "Temp_Min(C°)": -32.0,
      "Pendiente°": 12.8,
      "Indice_vegetacion(NDVI)": 0.02,
      Azufres_Sulfatos: 0.92,
      "Amplitud_termica_(Delta_T)": 36.0,
      "Polvo/aerosoles": 0.03,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Svalbard_Landscape.jpg/640px-Svalbard_Landscape.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Fiordo Axel Heiberg (Manantiales de Lost Hammer)",
      Pais_Region: "Canada",
      Tipo_Entorno: "Permafrost polar con manantiales subcero de sulfatos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 79.116,
      Longitud: -90.35,
      "Temp_Max(C°)": 3.0,
      "Temp_Min(C°)": -45.0,
      "Pendiente°": 10.5,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.7,
      "Amplitud_termica_(Delta_T)": 48.0,
      "Polvo/aerosoles": 0.02,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Axel_Heiberg_Island.jpg/640px-Axel_Heiberg_Island.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Península de Kamchatka (Tolbachik)",
      Pais_Region: "Rusia",
      Tipo_Entorno: "Conos de escoria basaltica y fisuras volcanicas",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 55.83,
      Longitud: 160.33,
      "Temp_Max(C°)": 16.0,
      "Temp_Min(C°)": -26.0,
      "Pendiente°": 11.9,
      "Indice_vegetacion(NDVI)": 0.03,
      Azufres_Sulfatos: 1.32,
      "Amplitud_termica_(Delta_T)": 42.0,
      "Polvo/aerosoles": 0.14,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Tolbachik_Volcano.jpg/640px-Tolbachik_Volcano.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Volcan Kawah Ijen",
      Pais_Region: "Indonesia",
      Tipo_Entorno: "Crater volcanico hiperacido rico en azufre nativo",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -8.058,
      Longitud: 114.242,
      "Temp_Max(C°)": 26.0,
      "Temp_Min(C°)": 8.0,
      "Pendiente°": 17.6,
      "Indice_vegetacion(NDVI)": 0.09,
      Azufres_Sulfatos: 1.98,
      "Amplitud_termica_(Delta_T)": 18.0,
      "Polvo/aerosoles": 0.45,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Kawah_Ijen_Sulfur.jpg/640px-Kawah_Ijen_Sulfur.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Volcan Poas (Laguna Caliente)",
      Pais_Region: "Costa Rica",
      Tipo_Entorno: "Crater fumarolico hiperacido de sulfatos",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 10.198,
      Longitud: -84.231,
      "Temp_Max(C°)": 20.0,
      "Temp_Min(C°)": 6.0,
      "Pendiente°": 13.4,
      "Indice_vegetacion(NDVI)": 0.11,
      Azufres_Sulfatos: 1.86,
      "Amplitud_termica_(Delta_T)": 14.0,
      "Polvo/aerosoles": 0.35,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Poas_Crater.jpg/640px-Poas_Crater.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Valle de la Luna (Ischigualasto)",
      Pais_Region: "Argentina",
      Tipo_Entorno: "Cuenca sedimentaria arida con arcillas y cenizas",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -30.163,
      Longitud: -67.843,
      "Temp_Max(C°)": 35.0,
      "Temp_Min(C°)": -4.0,
      "Pendiente°": 3.9,
      "Indice_vegetacion(NDVI)": 0.04,
      Azufres_Sulfatos: 1.34,
      "Amplitud_termica_(Delta_T)": 39.0,
      "Polvo/aerosoles": 0.24,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Ischigualasto_Valle_de_la_Luna.jpg/640px-Ischigualasto_Valle_de_la_Luna.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Desierto de Taklamakan",
      Pais_Region: "China",
      Tipo_Entorno: "Mar de dunas activas y tormentas de polvo extremas",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 38.9,
      Longitud: 82.2,
      "Temp_Max(C°)": 42.0,
      "Temp_Min(C°)": -20.0,
      "Pendiente°": 1.1,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.25,
      "Amplitud_termica_(Delta_T)": 62.0,
      "Polvo/aerosoles": 0.82,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Taklamakan_Desert.jpg/640px-Taklamakan_Desert.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Desierto del Gobi (Flaming Cliffs)",
      Pais_Region: "Mongolia",
      Tipo_Entorno: "Cuenca arida fria con gran amplitud termica",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 44.136,
      Longitud: 103.708,
      "Temp_Max(C°)": 36.0,
      "Temp_Min(C°)": -32.0,
      "Pendiente°": 2.8,
      "Indice_vegetacion(NDVI)": 0.03,
      Azufres_Sulfatos: 1.28,
      "Amplitud_termica_(Delta_T)": 68.0,
      "Polvo/aerosoles": 0.54,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flaming_Cliffs_Gobi.jpg/640px-Flaming_Cliffs_Gobi.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Depresion de Bodele",
      Pais_Region: "Chad",
      Tipo_Entorno: "Fuente principal de tormentas de polvo y aerosoles en la Tierra",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 16.85,
      Longitud: 18.25,
      "Temp_Max(C°)": 47.0,
      "Temp_Min(C°)": 11.0,
      "Pendiente°": 0.6,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.15,
      "Amplitud_termica_(Delta_T)": 36.0,
      "Polvo/aerosoles": 0.95,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bodele_Depression_Dust.jpg/640px-Bodele_Depression_Dust.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Salinas Grandes",
      Pais_Region: "Argentina",
      Tipo_Entorno: "Planicie evaporitica de altura en la Puna",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -23.633,
      Longitud: -65.95,
      "Temp_Max(C°)": 24.0,
      "Temp_Min(C°)": -15.0,
      "Pendiente°": 0.4,
      "Indice_vegetacion(NDVI)": 0.01,
      Azufres_Sulfatos: 1.6,
      "Amplitud_termica_(Delta_T)": 39.0,
      "Polvo/aerosoles": 0.14,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Salinas_Grandes_Jujuy.jpg/640px-Salinas_Grandes_Jujuy.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Monte Erebus",
      Pais_Region: "Antartida",
      Tipo_Entorno: "Volcan activo polar con cuevas de hielo fumarolicas",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -77.529,
      Longitud: 167.153,
      "Temp_Max(C°)": -18.0,
      "Temp_Min(C°)": -55.0,
      "Pendiente°": 16.8,
      "Indice_vegetacion(NDVI)": 0.0,
      Azufres_Sulfatos: 1.2,
      "Amplitud_termica_(Delta_T)": 37.0,
      "Polvo/aerosoles": 0.02,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Mount_Erebus_Antarctica.jpg/640px-Mount_Erebus_Antarctica.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Crater Zhamanshin",
      Pais_Region: "Kazajistan",
      Tipo_Entorno: "Crater de impacto en estepa arida con vidrios de impacto",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: 48.4,
      Longitud: 60.966,
      "Temp_Max(C°)": 38.0,
      "Temp_Min(C°)": -28.0,
      "Pendiente°": 3.4,
      "Indice_vegetacion(NDVI)": 0.06,
      Azufres_Sulfatos: 1.1,
      "Amplitud_termica_(Delta_T)": 66.0,
      "Polvo/aerosoles": 0.44,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Meteor_Crater_-_Arizona.jpg/640px-Meteor_Crater_-_Arizona.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
    {
      Sitio: "Campo Volcanico de Catels (Undara)",
      Pais_Region: "Australia",
      Tipo_Entorno: "Uno de los sistemas de tubos de lava mas largos de la Tierra",
      Tipo: "CANDIDATO_TIERRA",
      Latitud: -18.2,
      Longitud: 144.633,
      "Temp_Max(C°)": 36.0,
      "Temp_Min(C°)": 10.0,
      "Pendiente°": 1.5,
      "Indice_vegetacion(NDVI)": 0.12,
      Azufres_Sulfatos: 0.5,
      "Amplitud_termica_(Delta_T)": 26.0,
      "Polvo/aerosoles": 0.22,
      Imagen_URL:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Mauna_Loa_Volcano.jpg/640px-Mauna_Loa_Volcano.jpg",
      Referencias:
        "Microsoft Planetary Computer STAC API: NASA NASADEM 30m / MODIS LST MOD11A1 / Landsat 8-9 OLI-TIRS / MODIS AOD",
    },
  ];
let targets = [],
  earth = [],
  activeWorld = "Luna",
  activeTarget = null,
  ranked = [],
  markers = null,
  map = null;
function calcularSimilitud(site, target) {
  let weighted = 0,
    totalWeight = 0;
  const desglose = {};
  for (const [key, meta] of Object.entries(PARAMS)) {
    const a = Number(target[key]),
      b = Number(site[key]);
    if (
      target[key] === null ||
      target[key] === undefined ||
      target[key] === "" ||
      !Number.isFinite(a) ||
      !Number.isFinite(b)
    )
      continue;
    const z = Math.abs(b - a) / meta.scale,
      score = 100 * Math.exp(-(z * z));
    desglose[key] = {
      tierra: b,
      objetivo: a,
      similitud: Math.round(score * 10) / 10,
    };
    weighted += score * meta.weight;
    totalWeight += meta.weight;
  }
  return {
    total: totalWeight ? Math.round((weighted / totalWeight) * 10) / 10 : 0,
    desglose,
    evaluados: Object.keys(desglose).length,
  };
}
function targetFor(world) {
  return targets.filter((x) => x.Cuerpo === world);
}
function refreshMap() {
  if (map && document.querySelector("#map").offsetWidth)
    requestAnimationFrame(() => map.invalidateSize(true));
}
function initMap() {
  map = L.map("map", { worldCopyJump: true }).setView([20, 0], 2);
  const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
    }).addTo(map),
    standard = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    });
  L.control.layers({ Dark: dark, Map: standard }, null, { position: "bottomright" }).addTo(map);
  new ResizeObserver(refreshMap).observe(document.querySelector("#map"));
  window.addEventListener("resize", refreshMap);
  map.whenReady(refreshMap);
}
function setWorld(world) {
  activeWorld = world;
  document.querySelector("#active-world").textContent = `/ ${world === "Luna" ? "Moon" : "Mars"}`;
  const options = targetFor(world),
    select = document.querySelector("#target-select");
  select.innerHTML = options.map((x, i) => `<option value="${i}">${x.Sitio}</option>`).join("");
  activeTarget = options[0] || {};
  rankAndRender();
}
function rankAndRender() {
  ranked = earth
    .map((site) => ({ ...site, match: calcularSimilitud(site, activeTarget) }))
    .sort((a, b) => b.match.total - a.match.total);
  renderMarkers();
  if (ranked[0]) showDetail(ranked[0]);
  renderRanking();
}
function renderMarkers() {
  if (!map) return;
  if (markers) markers.clearLayers();
  markers = L.layerGroup();
  ranked.forEach((site, index) => {
    const icon = L.divIcon({
      className: "candidate-marker",
      html: `<span style="display:block;background:#ff5964;width:${index < 10 ? 14 : 10}px;height:${index < 10 ? 14 : 10}px;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px #0008"></span>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([site.Latitud, site.Longitud], { icon, title: site.Sitio })
      .bindTooltip(
        `#${index + 1} · ${site.Sitio}<br><b>${site.match.total.toFixed(1)}%</b> similarity`,
        { direction: "top" },
      )
      .on("click", () => showDetail(site))
      .addTo(markers);
  });
  markers.addTo(map);
  refreshMap();
}
function showDetail(site) {
  const panel = document.querySelector("#detail-panel"),
    m = site.match;
  const rows = Object.entries(m.desglose)
    .map(
      ([key, v]) =>
        `<tr><td>${PARAMS[key].label}</td><td>${v.tierra.toFixed(2)} ${PARAMS[key].unit}</td><td>${v.objetivo.toFixed(2)} ${PARAMS[key].unit}</td><td><b>${v.similitud.toFixed(1)}%</b></td></tr>`,
    )
    .join("");
  const best =
    Object.entries(m.desglose)
      .sort((a, b) => b[1].similitud - a[1].similitud)
      .slice(0, 2)
      .map((x) => PARAMS[x[0]].label)
      .join(" and ") || "the available parameters";
  document.querySelector("#detail-content").innerHTML =
    `<div class="detail-inner"><img class="site-image" src="${site.Imagen_URL}" alt="${site.Sitio}" onerror="this.style.display='none'"><p class="eyebrow">CANDIDATE #${ranked.indexOf(site) + 1} ? EARTH CANDIDATE</p><h2>${site.Sitio}</h2><p class="muted">${site.Pais_Region.replace("Antartida", "Antarctica")}<br><span class="coords">${Number(site.Latitud).toFixed(3)}, ${Number(site.Longitud).toFixed(3)}</span></p><div class="score">${m.total.toFixed(1)}%</div><div class="score-label">Weighted similarity ? ${m.evaluados} parameters</div><div class="progress"><i style="width:${m.total}%"></i></div><p class="muted">Compared with <b>${activeTarget.Sitio || "custom target"}</b></p><table class="comparison"><thead><tr><th>Parameter</th><th>Earth</th><th>Target</th><th>Match</th></tr></thead><tbody>${rows}</tbody></table><div class="why"><b>Why is it analogous?</b><p>The strongest matches are ${best}. ${englishEnvironment(site.Tipo_Entorno)} provides a useful field context for planetary research.</p><p class="muted">The analogy has limits: Earth gravity is 1g versus 0.16g on the Moon and 0.38g on Mars. Atmospheric pressure, radiation, and composition also differ.</p></div><div class="refs"><b>References</b><br>${site.Referencias}<br><br><b>Target references</b><br>${activeTarget.Referencias || "User-provided parameters"}</div></div>`;
  panel.classList.add("open");
}
function renderRanking() {
  const list = document.querySelector("#ranking-list");
  if (!list) return;
  const limit = Number(document.querySelector("#ranking-limit").value || 10);
  document.querySelector("#ranking-summary").textContent =
    `${ranked.length} candidates · weighted Gaussian distance`;
  list.innerHTML = ranked
    .slice(0, limit)
    .map(
      (s, i) =>
        `<div class="ranking-row" data-index="${i}"><span class="rank-number">#${i + 1}</span><span class="rank-site"><strong>${s.Sitio}</strong><small>${s.Pais_Region} · ${englishEnvironment(s.Tipo_Entorno)}</small></span><span class="rank-bar"><i style="width:${s.match.total}%"></i></span><span class="rank-score">${s.match.total.toFixed(1)}%</span></div>`,
    )
    .join("");
  list.querySelectorAll(".ranking-row").forEach(
    (row) =>
      (row.onclick = () => {
        showDetail(ranked[Number(row.dataset.index)]);
        document.querySelector("#ranking-dialog").close();
      }),
  );
}
function setupCustom() {
  document.querySelector("#custom-fields").innerHTML = Object.entries(PARAMS)
    .map(
      ([key, meta]) =>
        `<label>${meta.label}<input name="${key}" type="number" step="any" ${key.includes("NDVI") ? "min=0 max=1" : ""}></label>`,
    )
    .join("");
  document.querySelector("#custom-dialog").showModal();
}
async function loadData() {
  try {
    const [a, b] = await Promise.all([
      fetch("data/objetivos_espaciales.json"),
      fetch("data/tierra_procesada.json"),
    ]);
    if (!a.ok || !b.ok) throw Error();
    targets = await a.json();
    earth = await b.json();
  } catch (e) {
    targets = FALLBACK_TARGETS;
    earth = FALLBACK_EARTH;
  }
  document.querySelector("#candidate-count").textContent = `· ${earth.length} sites`;
}
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  document.querySelectorAll("[data-world]").forEach(
    (button) =>
      (button.onclick = () => {
        document.querySelector("#welcome").classList.add("hidden");
        document.querySelector("#app").classList.remove("hidden");
        if (!map) initMap();
        setWorld(button.dataset.world);
        refreshMap();
        setTimeout(refreshMap, 250);
      }),
  );
  document.querySelector("#target-select").onchange = (e) => {
    activeTarget = targetFor(activeWorld)[Number(e.target.value)];
    rankAndRender();
  };
  document.querySelector("#custom-target").onclick = setupCustom;
  document.querySelector("#close-detail").onclick = () =>
    document.querySelector("#detail-panel").classList.remove("open");
  document.querySelector("#ranking-button").onclick = () => {
    renderRanking();
    document.querySelector("#ranking-dialog").showModal();
  };
  document.querySelector("#close-ranking").onclick = () =>
    document.querySelector("#ranking-dialog").close();
  document.querySelector("#ranking-limit").onchange = renderRanking;
  document.querySelector("#custom-form").onsubmit = (e) => {
    if (e.submitter?.id !== "apply-custom") return;
    const form = new FormData(e.target),
      custom = {
        Sitio: "Custom mission",
        Referencias: "User-provided parameters",
      };
    Object.keys(PARAMS).forEach((key) => {
      const value = form.get(key);
      custom[key] = value === "" ? null : Number(value);
    });
    if (
      custom["Temp_Max(C°)"] !== null &&
      custom["Temp_Min(C°)"] !== null &&
      custom["Amplitud_termica_(Delta_T)"] === null
    )
      custom["Amplitud_termica_(Delta_T)"] = custom["Temp_Max(C°)"] - custom["Temp_Min(C°)"];
    activeTarget = custom;
    rankAndRender();
  };
});
