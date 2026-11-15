import L from "leaflet";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/inter";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import targetData from "./data/objetivos_espaciales.json";
import earthData from "./data/tierra_procesada.json";

/* -------------------------------------------------------------------------- */
/* English vocabulary                                                         */
/* -------------------------------------------------------------------------- */

/**
 * The dataset keeps its original Spanish field values. The interface is
 * English only, so descriptions and country names are translated when they are
 * rendered. The data files themselves stay untouched.
 */
const ENVIRONMENT_EN = {
  "Campo volcanico y crateres maar": "Volcanic field with maar craters",
  "Desierto polar hiperarido": "Hyperarid polar desert",
  "Desierto hiperarido y cuencas salinas": "Hyperarid desert with salt basins",
  "Planicie evaporitica de sulfatos y litio": "Evaporitic sulfate and lithium plain",
  "Crater de impacto polar en permafrost": "Polar impact crater in permafrost",
  "Flujos basalticos y tubos de lava": "Basaltic flows and lava tubes",
  "Cuenca eolica extrema y yardangs": "Extreme wind-sculpted basin with yardangs",
  "Sistema hidrotermal acido y sulfatos": "Acidic hydrothermal system with sulfates",
  "Ambiente acido extremo rico en hierro y azufre":
    "Extreme acidic environment rich in iron and sulfur",
  "Volcan en escudo basaltico y tubos de lava": "Basaltic shield volcano with lava tubes",
  "Planicie volcanica subpolar y fisuras basalticas":
    "Subpolar volcanic plain with basaltic fissures",
  "Crater de impacto preservado en desierto": "Well-preserved impact crater in desert",
  "Crater de impacto en trampa basaltica": "Impact crater in a basaltic trap",
  "Crater de impacto subartico": "Subarctic impact crater",
  "Valles de arenisca y oxidos de hierro": "Sandstone valleys with iron oxides",
  "Campo de megadunas eolicas hiperaridas": "Field of hyperarid megadunes",
  "Altiplano hiperarido de gran altitud": "High-altitude hyperarid plateau",
  "Estratovolcan basaltico y piroclastos": "Basaltic stratovolcano with pyroclastics",
  "Caldera volcanica de alta montana": "High-mountain volcanic caldera",
  "Campos de lava basaltica y tubos volcanicos": "Basaltic lava fields and volcanic tubes",
  "Playas de sulfatos y yardangs eolicos": "Sulfate flats with wind-carved yardangs",
  "Cuenca desertica extrema bajo el nivel del mar":
    "Extreme desert basin below sea level",
  "Crater de impacto cubierto por dunas eolicas":
    "Impact crater covered by wind-blown dunes",
  "Crater de impacto en desierto arido": "Impact crater in an arid desert",
  "Terreno arcaico rico en oxidos de hierro y silice":
    "Archaic terrain rich in iron oxides and silica",
  "Crater de impacto simple en el Sahara central":
    "Simple impact crater in the central Sahara",
  "Crater de impacto circular en el Sahara": "Circular impact crater in the Sahara",
  "Domo geologico erosionado con anillos concentricos":
    "Eroded geological dome with concentric rings",
  "Volcan en escudo piroclastico en el Sahara": "Pyroclastic shield volcano in the Sahara",
  "Domos de lava tobas y tubos basalticos": "Lava domes, tuffs and basaltic tubes",
  "Crater maar volcanico con fondo de fosfatos y sales":
    "Volcanic maar crater with phosphate and salt deposits",
  "Cuenca evaporitica hiperarida y abanicos aluviales":
    "Hyperarid evaporitic basin with alluvial fans",
  "Estratos de arcillas esmectitas y oxidos de hierro":
    "Smectite clay strata with iron oxides",
  "Campo de dunas de sulfato de calcio (yeso)": "Calcium sulfate (gypsum) dune field",
  "Lago alcalino hipersalino con torres de carbonato":
    "Hypersaline alkaline lake with carbonate towers",
  "Cuenca evaporitica andina y vulcanismo": "Andean evaporitic basin with volcanism",
  "Campo volcanico con mas de 800 conos basalticos":
    "Volcanic field with more than 800 basaltic cones",
  "Centros volcanicos subpolares en permafrost": "Subpolar volcanic centres in permafrost",
  "Permafrost polar con manantiales subcero de sulfatos":
    "Polar permafrost with subzero sulfate springs",
  "Conos de escoria basaltica y fisuras volcanicas":
    "Basaltic scoria cones and volcanic fissures",
  "Crater volcanico hiperacido rico en azufre nativo":
    "Hyperacid volcanic crater rich in native sulfur",
  "Crater fumarolico hiperacido de sulfatos": "Hyperacid fumarolic crater with sulfates",
  "Cuenca sedimentaria arida con arcillas y cenizas":
    "Arid sedimentary basin with clays and ash",
  "Mar de dunas activas y tormentas de polvo extremas":
    "Sea of active dunes with extreme dust storms",
  "Cuenca arida fria con gran amplitud termica":
    "Cold arid basin with a wide thermal range",
  "Fuente principal de tormentas de polvo y aerosoles en la Tierra":
    "Major source of dust storms and aerosols on Earth",
  "Planicie evaporitica de altura en la Puna": "High-altitude evaporitic plain in the Puna",
  "Volcan activo polar con cuevas de hielo fumarolicas":
    "Active polar volcano with fumarolic ice caves",
  "Crater de impacto en estepa arida con vidrios de impacto":
    "Impact crater in arid steppe with impact glasses",
  "Uno de los sistemas de tubos de lava mas largos de la Tierra":
    "One of the longest lava tube systems on Earth",
};

const COUNTRY_EN = {
  Mexico: "Mexico",
  Antartida: "Antarctica",
  Chile: "Chile",
  Bolivia: "Bolivia",
  Canada: "Canada",
  "Estados Unidos": "United States",
  Iran: "Iran",
  Etiopia: "Ethiopia",
  Espana: "Spain",
  "Estados Unidos (Hawai)": "United States (Hawaii)",
  Islandia: "Iceland",
  India: "India",
  Jordania: "Jordan",
  Namibia: "Namibia",
  Italia: "Italy",
  China: "China",
  Australia: "Australia",
  Argelia: "Algeria",
  Mauritania: "Mauritania",
  Chad: "Chad",
  "Arabia Saudita": "Saudi Arabia",
  Argentina: "Argentina",
  Noruega: "Norway",
  Rusia: "Russia",
  Indonesia: "Indonesia",
  "Costa Rica": "Costa Rica",
  Mongolia: "Mongolia",
  Kazajistan: "Kazakhstan",
};

// Fallback for free-text descriptions that are not in the dictionary above.
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
  const raw = String(text || "").trim();
  if (!raw) return "";
  if (ENVIRONMENT_EN[raw]) return ENVIRONMENT_EN[raw];
  let value = raw;
  ENVIROMAP.forEach(([from, to]) => (value = value.replaceAll(from, to)));
  return value;
}

function englishCountry(text) {
  const raw = String(text || "").trim();
  return COUNTRY_EN[raw] || raw;
}

/* -------------------------------------------------------------------------- */
/* Comparable parameters                                                      */
/* -------------------------------------------------------------------------- */

/**
 * `min` / `max` are validation bounds for user-provided values. `scale` and
 * `weight` keep the weighted Gaussian distance used by the original model.
 */
const PARAMS = {
  "Temp_Max(C°)": {
    label: "Maximum temperature",
    unit: "°C",
    scale: 25,
    weight: 1.2,
    min: -150,
    max: 150,
    step: 0.1,
  },
  "Temp_Min(C°)": {
    label: "Minimum temperature",
    unit: "°C",
    scale: 30,
    weight: 1.2,
    min: -200,
    max: 100,
    step: 0.1,
  },
  "Amplitud_termica_(Delta_T)": {
    label: "Thermal range (ΔT)",
    unit: "°C",
    scale: 40,
    weight: 1.3,
    min: 0,
    max: 400,
    step: 0.1,
  },
  "Pendiente°": {
    label: "Slope",
    unit: "°",
    scale: 5,
    weight: 1,
    min: 0,
    max: 90,
    step: 0.01,
  },
  "Indice_vegetacion(NDVI)": {
    label: "Vegetation index",
    unit: "NDVI",
    scale: 0.15,
    weight: 0.8,
    min: 0,
    max: 1,
    step: 0.01,
  },
  "Polvo/aerosoles": {
    label: "Dust / aerosol",
    unit: "AOD",
    scale: 0.2,
    weight: 1,
    min: 0,
    max: 5,
    step: 0.01,
  },
  Azufres_Sulfatos: {
    label: "Sulfate index",
    unit: "index",
    scale: 0.25,
    weight: 1.3,
    min: 0,
    max: 5,
    step: 0.01,
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

/* -------------------------------------------------------------------------- */
/* Application state                                                          */
/* -------------------------------------------------------------------------- */

const ZOOM_TARGET = 6;
const THEME_STORAGE_KEY = "worlds-map-theme";
let PARAM_KEYS = Object.keys(PARAMS);

/* -------------------------------------------------------------------------- */
/* Backend connection (optional)                                              */
/* -------------------------------------------------------------------------- */

/**
 * The Python server injects `window.ANALOG_API_BASE`. A `?api=` query parameter
 * can point the page at another instance, and the Vite dev server proxies
 * `/api` by default. With no backend configured the app keeps working offline
 * and scores candidates in the browser.
 */
const API_BASE = resolveApiBase();
const API_TIMEOUT = 8000;
let apiAvailable = false;
let rankingToken = 0;

function resolveApiBase() {
  try {
    const override = new URLSearchParams(window.location.search).get("api");
    if (override) return override.replace(/\/+$/, "");
  } catch (error) {
    /* ignore malformed query strings */
  }
  if (
    typeof window !== "undefined" &&
    typeof window.ANALOG_API_BASE === "string" &&
    window.ANALOG_API_BASE
  ) {
    return window.ANALOG_API_BASE.replace(/\/+$/, "");
  }

  const envBase = import.meta.env.VITE_ANALOG_API_BASE;
  if (envBase) return String(envBase).replace(/\/+$/, "");

  if (import.meta.env.DEV) return "/api";
  return "";
}

async function fetchJson(path, options = {}) {
  if (!API_BASE) throw new Error("No backend is configured.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  if (options.body) headers["Content-Type"] = "application/json";

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    if (!response.ok) {
      let detail = "";
      try {
        const payload = await response.json();
        detail =
          payload.error ||
          payload.errors?._form ||
          JSON.stringify(payload.errors || payload);
      } catch (error) {
        detail = response.statusText;
      }
      throw new Error(detail || `Request failed (${response.status})`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Merge the server parameter catalog into the local fallback table. */
function mergeParameterCatalog(catalog) {
  if (!catalog || typeof catalog !== "object") return;
  Object.entries(catalog).forEach(([key, meta]) => {
    if (!meta || typeof meta !== "object") return;
    if (PARAMS[key]) {
      Object.assign(PARAMS[key], meta);
    } else {
      PARAMS[key] = { ...meta };
    }
  });
  PARAM_KEYS = Object.keys(PARAMS);
}

function setDataSource(source, extra = "") {
  const label = $("#data-source");
  if (label) {
    label.dataset.mode = source === "api" ? "api" : "offline";
    label.textContent =
      source === "api"
        ? `Live API${extra ? ` · ${extra}` : ""}`
        : "Prototype · offline mode";
  }
  const note = $("#welcome-note");
  if (note) {
    note.textContent =
      source === "api"
        ? "Prototype · similarity is computed by the Python backend."
        : "Prototype · similarity is computed locally from the bundled sample dataset.";
  }
}

async function initBackend() {
  if (!API_BASE) {
    setDataSource("offline");
    return false;
  }

  try {
    const health = await fetchJson("/health");
    if (health?.status !== "ok") throw new Error("Backend is not healthy.");
    try {
      const spec = await fetchJson("/parameters");
      mergeParameterCatalog(spec?.parameters);
    } catch (error) {
      console.warn("Parameter catalog unavailable, keeping local values:", error);
    }
    apiAvailable = true;
    setDataSource("api", `${health.source || "data"}`);
    return true;
  } catch (error) {
    console.warn("Backend unavailable, using offline mode:", error);
    apiAvailable = false;
    setDataSource("offline");
    return false;
  }
}

/** Convert a server match object into the shape the renderers expect. */
function clientMatch(match) {
  const desglose = {};
  Object.entries(match?.breakdown || {}).forEach(([key, item]) => {
    desglose[key] = {
      tierra: item.earth,
      objetivo: item.target,
      similitud: item.match,
    };
  });
  return {
    total: Number(match?.score) || 0,
    desglose,
    evaluados: Number(match?.parameterCount) || 0,
  };
}

function fromServerRecord(record) {
  const { match, ...site } = record;
  return { ...site, match: clientMatch(match) };
}

/** Only the comparable values are sent as a custom target. */
function pickTargetValues(target) {
  const values = {};
  PARAM_KEYS.forEach((key) => {
    if (hasValue(target?.[key])) values[key] = Number(target[key]);
  });
  return values;
}

let targets = [],
  earth = [],
  activeWorld = "Luna",
  activeTarget = null,
  customTarget = null,
  ranked = [],
  selectedSite = null,
  markers = null,
  map = null,
  baseLayers = null,
  activeBase = null,
  theme = "dark",
  suppressMarkerClick = false;

const $ = (selector) => document.querySelector(selector);

function displayWorld(world) {
  if (world === "Luna") return "Moon";
  if (world === "Marte") return "Mars";
  return world;
}

function siteKey(site) {
  return `${site.Sitio}|${site.Latitud}|${site.Longitud}`;
}

function hasValue(value) {
  return (
    value !== null &&
    value !== undefined &&
    value !== "" &&
    Number.isFinite(Number(value))
  );
}

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function formatNumber(value, digits = 2) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const text = number.toFixed(digits);
  return text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
}

/** OpenStreetMap deep link built from the coordinates of a single location. */
function coordinateLink(site) {
  const lat = Number(site?.Latitud);
  const lng = Number(site?.Longitud);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "";
  const latitude = lat.toFixed(5);
  const longitude = lng.toFixed(5);
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=9/${latitude}/${longitude}`;
}

/* -------------------------------------------------------------------------- */
/* Theme (light / dark)                                                       */
/* -------------------------------------------------------------------------- */

function storedTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch (error) {
    /* storage can be unavailable in private contexts */
  }
  return "dark";
}

function applyTheme(next, { persist = true } = {}) {
  theme = next === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;

  document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
    toggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    toggle.setAttribute(
      "aria-label",
      `Switch to ${theme === "dark" ? "light" : "dark"} mode`,
    );
  });

  // Keep the map readable in both themes: swap the CARTO dark layer for the
  // standard OpenStreetMap layer. The layer control stays in sync because
  // Leaflet listens to add/remove events on the map.
  if (map && baseLayers) {
    const desired = theme === "dark" ? baseLayers.dark : baseLayers.standard;
    if (activeBase && map.hasLayer(activeBase)) map.removeLayer(activeBase);
    if (!map.hasLayer(desired)) desired.addTo(map);
    activeBase = desired;
    refreshMap();
  }

  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      /* ignore */
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Similarity model                                                           */
/* -------------------------------------------------------------------------- */

function calcularSimilitud(site, target) {
  let weighted = 0;
  let totalWeight = 0;
  const desglose = {};

  for (const [key, meta] of Object.entries(PARAMS)) {
    // A parameter is compared only when BOTH the reference target and the
    // candidate hold a real value. Missing data is never read as zero and is
    // excluded from the weighted average.
    if (!hasValue(target?.[key]) || !hasValue(site?.[key])) continue;

    const a = Number(target[key]);
    const b = Number(site[key]);
    const z = Math.abs(b - a) / meta.scale;
    const score = 100 * Math.exp(-(z * z));

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
  return targets.filter((item) => item.Cuerpo === world);
}

function describeTarget() {
  if (!activeTarget) return "no reference target";
  return activeTarget.Sitio || "custom target";
}

function targetCoverage(target) {
  return PARAM_KEYS.filter((key) => hasValue(target?.[key])).length;
}

/** Compact signed coordinate, e.g. 89.9°S / 0°E. */
function formatCoordinate(value, axis) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  const hemisphere =
    axis === "lat" ? (number >= 0 ? "N" : "S") : number >= 0 ? "E" : "W";
  return `${formatNumber(Math.abs(number), 2)}°${hemisphere}`;
}

/**
 * Keep the mission console in sync with the reference target and the current
 * ranking. It only reflects state; it never changes the similarity model.
 */
function updateTargetFacts() {
  const body = $("#fact-body");
  if (body) body.textContent = displayWorld(activeWorld);

  const coords = $("#fact-coords");
  if (coords) {
    const hasCoordinates =
      hasValue(activeTarget?.Latitud) && hasValue(activeTarget?.Longitud);
    coords.textContent = hasCoordinates
      ? `${formatCoordinate(activeTarget.Latitud, "lat")} / ${formatCoordinate(activeTarget.Longitud, "lng")}`
      : "Not defined";
  }

  const params = $("#fact-params");
  if (params) {
    params.textContent = activeTarget
      ? `${targetCoverage(activeTarget)} / ${PARAM_KEYS.length}`
      : "—";
  }

  const best = $("#fact-best");
  if (best) {
    best.textContent =
      ranked.length && ranked[0]?.match
        ? `${ranked[0].match.total.toFixed(1)}% · ${ranked[0].Sitio}`
        : "No candidates";
  }

  const legendTarget = $("#legend-target");
  if (legendTarget) {
    legendTarget.textContent = activeTarget
      ? `vs. ${describeTarget()}`
      : "Ranked by similarity";
  }
}

/* -------------------------------------------------------------------------- */
/* Map                                                                        */
/* -------------------------------------------------------------------------- */

function refreshMap() {
  if (map && map.getContainer().offsetWidth) {
    requestAnimationFrame(() => map.invalidateSize(true));
  }
}

function initMap() {
  map = L.map("map", {
    worldCopyJump: true,
    zoomControl: false,
    minZoom: 2,
  }).setView([20, 0], 2);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  baseLayers = {
    dark: L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }),
    standard: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }),
  };

  activeBase = theme === "dark" ? baseLayers.dark : baseLayers.standard;
  activeBase.addTo(map);

  L.control
    .layers(
      { "Dark map": baseLayers.dark, "Standard map": baseLayers.standard },
      null,
      { position: "bottomright", collapsed: true },
    )
    .addTo(map);

  // A marker click that ends a map drag should never open a profile by mistake.
  map.on("dragstart", () => {
    suppressMarkerClick = true;
  });
  map.on("dragend", () => {
    setTimeout(() => {
      suppressMarkerClick = false;
    }, 120);
  });

  new ResizeObserver(refreshMap).observe($("#map"));
  window.addEventListener("resize", refreshMap);
  map.whenReady(refreshMap);
}

function fitCandidates() {
  if (!map || !ranked.length) return;

  const points = ranked
    .slice(0, 12)
    .map((site) => [Number(site.Latitud), Number(site.Longitud)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

  if (!points.length) return;
  if (points.length === 1) {
    map.setView(points[0], 5);
    return;
  }

  const wide = window.matchMedia("(min-width: 900px)").matches;
  map.fitBounds(L.latLngBounds(points), {
    paddingTopLeft: wide ? [430, 90] : [30, 150],
    paddingBottomRight: wide ? [340, 70] : [30, 40],
    maxZoom: 5,
  });
}

function setWorld(world) {
  activeWorld = world;
  customTarget = null;

  const label = $("#active-world");
  if (label) label.textContent = displayWorld(world);

  const index = $("#menu-world-index");
  if (index) index.textContent = world === "Marte" ? "02" : "01";

  document.querySelectorAll(".world-switch [data-world]").forEach((button) => {
    const active = button.dataset.world === world;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const options = targetFor(world);
  const select = $("#target-select");
  select.innerHTML = options
    .map((item, index) => `<option value="${index}">${escapeHtml(item.Sitio)}</option>`)
    .join("");

  const note = $("#target-note");
  if (note) {
    note.hidden = true;
    note.textContent = "";
  }

  activeTarget = options[0] || null;
  updateTargetFacts();
  rankAndRender();
}

/* -------------------------------------------------------------------------- */
/* Selection: markers ↔ ranking ↔ detail panel                                */
/* -------------------------------------------------------------------------- */

function selectSite(site, { fly = true, openPanel = true } = {}) {
  if (!site) return;

  const same = Boolean(selectedSite && siteKey(selectedSite) === siteKey(site));
  selectedSite = site;

  updateMarkerSelection();
  highlightRankingSelection();
  if (openPanel) showDetail(site);

  if (!fly || !map) return;

  const lat = Number(site.Latitud);
  const lng = Number(site.Longitud);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

  const zoom = Math.max(map.getZoom(), ZOOM_TARGET);
  const alreadyCentered = map.getCenter().distanceTo(L.latLng(lat, lng)) < 5000;

  // Repeated clicks on the same marker must not restart the flight animation.
  if (same && alreadyCentered && map.getZoom() >= ZOOM_TARGET) return;

  map.flyTo([lat, lng], zoom, { duration: 0.8 });
}

function updateMarkerSelection() {
  if (!markers) return;
  markers.eachLayer((marker) => {
    const active = Boolean(
      selectedSite && marker.siteKey === siteKey(selectedSite),
    );
    marker.setZIndexOffset(active ? 1000 : 0);
    const element = marker.getElement();
    if (element) {
      element.classList.toggle("is-selected", active);
      element.setAttribute("aria-current", active ? "true" : "false");
    }
  });
}

function highlightRankingSelection() {
  document.querySelectorAll(".ranking-row").forEach((row) => {
    const site = ranked[Number(row.dataset.index)];
    const active = Boolean(
      site && selectedSite && siteKey(site) === siteKey(selectedSite),
    );
    row.classList.toggle("is-selected", active);
    row.setAttribute("aria-pressed", String(active));
  });
}

/* -------------------------------------------------------------------------- */
/* Rendering                                                                  */
/* -------------------------------------------------------------------------- */

function renderMarkers() {
  if (!map) return;

  if (markers) {
    markers.clearLayers();
    map.removeLayer(markers);
  }

  markers = L.layerGroup();

  ranked.forEach((site, index) => {
    const isTop = index < 10;
    const size = isTop ? 14 : 10;
    const icon = L.divIcon({
      className: `candidate-marker${isTop ? " is-top" : ""}`,
      html: `<span class="candidate-marker__dot" style="width:${size}px;height:${size}px"></span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

    const marker = L.marker([site.Latitud, site.Longitud], {
      icon,
      title: `#${index + 1} ${site.Sitio} — ${site.match.total.toFixed(1)}% similarity`,
      alt: `${site.Sitio}, rank ${index + 1}`,
      keyboard: true,
      riseOnHover: true,
    });

    marker.siteKey = siteKey(site);

    marker
      .bindTooltip(
        `<b>#${index + 1} · ${escapeHtml(site.Sitio)}</b><br>${escapeHtml(englishCountry(site.Pais_Region))}<br><b>${site.match.total.toFixed(1)}%</b> similarity`,
        {
          direction: "top",
          offset: [0, -(size / 2)],
          className: "site-tooltip",
        },
      )
      .on("click", () => {
        if (suppressMarkerClick) return;
        selectSite(site);
      })
      .addTo(markers);
  });

  markers.addTo(map);
  updateMarkerSelection();
  refreshMap();
}

function showDetail(site) {
  const panel = $("#detail-panel");
  const content = $("#detail-content");
  if (!panel || !content) return;

  if (!site) {
    content.innerHTML =
      '<p class="muted empty-hint">No Earth analog candidates are available for this target.</p>';
    panel.classList.remove("open");
    return;
  }

  const match = site.match || calcularSimilitud(site, activeTarget);
  const rank = ranked.findIndex((item) => siteKey(item) === siteKey(site)) + 1;

  const entries = Object.entries(match.desglose).sort(
    (a, b) => b[1].similitud - a[1].similitud,
  );

  const rows = entries
    .map(([key, value]) => {
      const meta = PARAMS[key];
      return `<tr><td>${meta.label}</td><td>${formatNumber(value.tierra)} ${meta.unit}</td><td>${formatNumber(value.objetivo)} ${meta.unit}</td><td><b>${value.similitud.toFixed(1)}%</b></td></tr>`;
    })
    .join("");

  const strongest = entries
    .slice(0, 2)
    .map(
      ([key, value]) =>
        `${PARAMS[key].label.toLowerCase()} (${value.similitud.toFixed(0)}%)`,
    )
    .join(" and ");

  const link = coordinateLink(site);

  content.innerHTML = `
    <div class="detail-inner">
      <img class="site-image" src="${site.Imagen_URL}" alt="${escapeHtml(site.Sitio)}" onerror="this.style.display='none'">
      <p class="eyebrow">CANDIDATE #${rank || "–"} · EARTH ANALOG</p>
      <h2>${escapeHtml(site.Sitio)}</h2>
      <p class="muted">${escapeHtml(englishCountry(site.Pais_Region))}<br>${escapeHtml(englishEnvironment(site.Tipo_Entorno))}</p>
      <p class="coords">${Number(site.Latitud).toFixed(3)}, ${Number(site.Longitud).toFixed(3)}</p>
      ${link ? `<a class="coord-link" href="${link}" target="_blank" rel="noopener noreferrer">Open location on OpenStreetMap ↗</a>` : ""}
      <div class="score">${match.total.toFixed(1)}<span>%</span></div>
      <span class="score-label">Weighted similarity · ${match.evaluados} of ${PARAM_KEYS.length} parameters compared</span>
      <div class="progress" role="img" aria-label="Similarity ${match.total.toFixed(1)} percent"><i style="width:${match.total}%"></i></div>
      <p class="muted">Compared with <b>${escapeHtml(describeTarget())}</b></p>
      ${
        rows
          ? `<table class="comparison"><thead><tr><th>Parameter</th><th>Earth</th><th>Target</th><th>Match</th></tr></thead><tbody>${rows}</tbody></table>`
          : '<p class="muted">No shared parameters are available for this comparison.</p>'
      }
      <div class="why">
        <b>Why is it analogous?</b>
        <p>${strongest ? `The strongest matches are ${strongest}. ` : ""}${escapeHtml(englishEnvironment(site.Tipo_Entorno))} provides a useful field context for planetary research.</p>
        <p class="muted">The analogy has limits: Earth gravity is 1g versus 0.16g on the Moon and 0.38g on Mars. Atmospheric pressure, radiation, and composition also differ.</p>
      </div>
      <div class="refs"><b>References</b><br>${escapeHtml(site.Referencias)}<br><br><b>Target references</b><br>${escapeHtml(activeTarget?.Referencias || "User-provided parameters")}</div>
    </div>`;

  panel.classList.add("open");
}

function renderRanking() {
  const list = $("#ranking-list");
  if (!list) return;

  updateTargetFacts();

  const limitControl = $("#ranking-limit");
  const limit = Number(limitControl?.value || 10);
  const summary = $("#ranking-summary");

  if (summary) {
    const coverage = targetCoverage(activeTarget);
    summary.textContent = `${ranked.length} candidates · weighted Gaussian distance · ${coverage} of ${PARAM_KEYS.length} reference parameters`;
  }

  if (!ranked.length) {
    list.innerHTML =
      '<p class="muted empty-hint">No candidates are available for this target.</p>';
    return;
  }

  list.innerHTML = ranked
    .slice(0, limit)
    .map((site, index) => {
      const strongest = Object.entries(site.match.desglose)
        .sort((a, b) => b[1].similitud - a[1].similitud)
        .slice(0, 2)
        .map(
          ([key, value]) => `${PARAMS[key].label} ${value.similitud.toFixed(0)}%`,
        )
        .join(" · ");
      const link = coordinateLink(site);
      const active = Boolean(
        selectedSite && siteKey(selectedSite) === siteKey(site),
      );

      return `<div class="ranking-row${active ? " is-selected" : ""}" data-index="${index}" role="button" tabindex="0" aria-pressed="${active}" aria-label="Show ${escapeHtml(site.Sitio)} on the map">
        <span class="rank-number">#${index + 1}</span>
        <span class="rank-site">
          <strong>${escapeHtml(site.Sitio)}</strong>
          <small>${escapeHtml(englishCountry(site.Pais_Region))} · ${escapeHtml(englishEnvironment(site.Tipo_Entorno))}</small>
          <small class="rank-why">${strongest ? `Strongest: ${escapeHtml(strongest)} · ${site.match.evaluados} parameters` : "No shared parameters"}</small>
        </span>
        <span class="rank-bar" aria-hidden="true"><i style="width:${site.match.total}%"></i></span>
        <span class="rank-score">${site.match.total.toFixed(1)}%</span>
        ${
          link
            ? `<a class="rank-link" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(site.Sitio)} on OpenStreetMap" title="Open on OpenStreetMap" data-link>↗</a>`
            : "<span></span>"
        }
      </div>`;
    })
    .join("");
}

async function rankAndRender() {
  const token = ++rankingToken;
  const target = activeTarget;

  if (apiAvailable && target) {
    try {
      const isCustom = target === customTarget;
      const payload = isCustom
        ? { body: activeWorld, target: pickTargetValues(target) }
        : { body: activeWorld, targetId: target.Sitio };
      const response = await fetchJson("/analogs", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (token !== rankingToken) return;
      if (Array.isArray(response?.results)) {
        ranked = response.results.map(fromServerRecord);
        renderMarkers();
        renderRanking();
        if (!ranked.length) {
          selectedSite = null;
          showDetail(null);
          return;
        }
        selectSite(ranked[0], { fly: false, openPanel: true });
        fitCandidates();
        return;
      }
      throw new Error("The backend returned no results.");
    } catch (error) {
      console.warn("Server ranking failed, scoring locally:", error);
      if (token !== rankingToken) return;
    }
  }

  if (token !== rankingToken) return;

  ranked = earth
    .map((site) => ({
      ...site,
      match: calcularSimilitud(site, target),
    }))
    .sort((a, b) => b.match.total - a.match.total);

  renderMarkers();
  renderRanking();

  if (!ranked.length) {
    selectedSite = null;
    showDetail(null);
    return;
  }

  selectSite(ranked[0], { fly: false, openPanel: true });
  fitCandidates();
}

/* -------------------------------------------------------------------------- */
/* Custom target                                                              */
/* -------------------------------------------------------------------------- */

function fieldMarkup(key, meta, value) {
  const current = hasValue(value) ? value : "";
  return `<label class="custom-field">
    <span>${meta.label} <em>${meta.unit}</em></span>
    <input name="${key}" type="number" step="${meta.step}" min="${meta.min}" max="${meta.max}" inputmode="decimal" placeholder="Not available" autocomplete="off" value="${current}">
    <small class="field-error" data-error-for="${key}"></small>
  </label>`;
}

function setupCustom() {
  const fields = $("#custom-fields");
  if (!fields) return;

  const source = customTarget || {};
  fields.innerHTML = Object.entries(PARAMS)
    .map(([key, meta]) => fieldMarkup(key, meta, source[key]))
    .join("");

  renderFormErrors({});

  const dialog = $("#custom-dialog");
  if (dialog && !dialog.open) dialog.showModal();
}

function readCustomValues(form) {
  const data = new FormData(form);
  const values = {};
  PARAM_KEYS.forEach((key) => {
    const raw = data.get(key);
    values[key] =
      raw === null || String(raw).trim() === "" ? null : Number(raw);
  });
  return values;
}

function validateValues(values) {
  const errors = {};
  let provided = 0;

  for (const [key, meta] of Object.entries(PARAMS)) {
    const value = values[key];
    if (value === null || value === undefined) continue;

    if (!Number.isFinite(value)) {
      errors[key] = "Enter a valid number.";
      continue;
    }
    if (value < meta.min || value > meta.max) {
      errors[key] = `Enter a value between ${meta.min} and ${meta.max} ${meta.unit}.`;
      continue;
    }
    provided += 1;
  }

  const max = values["Temp_Max(C°)"];
  const min = values["Temp_Min(C°)"];
  if (Number.isFinite(max) && Number.isFinite(min) && max < min) {
    errors["Temp_Max(C°)"] =
      "Maximum temperature must be greater than or equal to the minimum.";
  }

  if (!provided && Object.keys(errors).length === 0) {
    errors._form = "Enter at least one environmental parameter.";
  }

  return { errors, provided };
}

function renderFormErrors(errors) {
  document.querySelectorAll("[data-error-for]").forEach((node) => {
    node.textContent = errors[node.dataset.errorFor] || "";
  });

  const formError = $("#custom-error");
  const message = errors._form || "";
  if (formError) {
    formError.textContent = message;
    formError.hidden = !message;
  }
}

function handleCustomSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const values = readCustomValues(form);

  // Derive the thermal range only when both temperatures are present and the
  // user left the field empty. A missing value is never treated as zero.
  if (
    values["Amplitud_termica_(Delta_T)"] === null &&
    Number.isFinite(values["Temp_Max(C°)"]) &&
    Number.isFinite(values["Temp_Min(C°)"])
  ) {
    values["Amplitud_termica_(Delta_T)"] =
      values["Temp_Max(C°)"] - values["Temp_Min(C°)"];
  }

  const { errors, provided } = validateValues(values);
  renderFormErrors(errors);

  if (Object.keys(errors).length) {
    const firstKey = Object.keys(errors).find((key) => key !== "_form");
    if (firstKey) {
      form.querySelector(`[name="${CSS.escape(firstKey)}"]`)?.focus();
    }
    return;
  }

  customTarget = {
    ...values,
    Sitio: "Custom target",
    Referencias: "User-provided environmental parameters",
    evaluados: provided,
  };
  activeTarget = customTarget;

  const select = $("#target-select");
  select.querySelector('option[value="custom"]')?.remove();
  const option = document.createElement("option");
  option.value = "custom";
  option.textContent = "Custom target";
  select.append(option);
  select.value = "custom";

  const note = $("#target-note");
  if (note) {
    note.textContent = `Custom target · ${provided} parameter${provided === 1 ? "" : "s"} defined`;
    note.hidden = false;
  }

  updateTargetFacts();
  closeDialog($("#custom-dialog"));
  rankAndRender();
}

function closeDialog(dialog) {
  if (dialog && dialog.open) dialog.close();
}

/* -------------------------------------------------------------------------- */
/* Data loading and wiring                                                    */
/* -------------------------------------------------------------------------- */

async function loadData() {
  if (apiAvailable) {
    try {
      const [targetsPayload, candidatesPayload] = await Promise.all([
        fetchJson("/targets"),
        fetchJson("/candidates"),
      ]);
      if (
        !Array.isArray(targetsPayload?.targets) ||
        !Array.isArray(candidatesPayload?.candidates)
      ) {
        throw new Error("The backend returned an unexpected dataset shape.");
      }
      targets = targetsPayload.targets;
      earth = candidatesPayload.candidates;
      updateCount();
      return;
    } catch (error) {
      console.warn("Backend datasets unavailable, using local files:", error);
      apiAvailable = false;
      setDataSource("offline");
    }
  }

  try {
    if (!Array.isArray(targetData) || !Array.isArray(earthData)) {
      throw new Error("The bundled dataset has an unexpected shape.");
    }

    targets = targetData;
    earth = earthData;
  } catch (error) {
    console.warn("Using the bundled fallback dataset:", error);
    targets = FALLBACK_TARGETS;
    earth = FALLBACK_EARTH;
  }

  updateCount();
}

function updateCount() {
  const count = $("#candidate-count");
  if (count) count.textContent = `· ${earth.length} sites`;

  const rankingCount = $("#ranking-count");
  if (rankingCount) rankingCount.textContent = String(earth.length);

  const worlds = new Set(targets.map((item) => item.Cuerpo).filter(Boolean));
  const pad = (value) => String(value).padStart(2, "0");

  const worldCount = $("#hero-world-count");
  if (worldCount) worldCount.textContent = pad(worlds.size || 2);

  const targetCount = $("#hero-target-count");
  if (targetCount) targetCount.textContent = pad(targets.length);

  const earthCount = $("#hero-earth-count");
  if (earthCount) earthCount.textContent = String(earth.length);

  // The landing cards describe the bundled targets today, but the lists are
  // derived from the dataset so new reference sites appear without editing the
  // markup.
  document.querySelectorAll("[data-target-list]").forEach((node) => {
    const names = targets
      .filter((item) => item.Cuerpo === node.dataset.targetList)
      .map((item) => item.Sitio)
      .filter(Boolean);
    if (!names.length) return;
    const shown = names.slice(0, 3).join(" · ");
    const extra = names.length > 3 ? ` · +${names.length - 3}` : "";
    node.textContent = `Targets: ${shown}${extra}`;
  });
}

function bindRankingList() {
  const list = $("#ranking-list");
  if (!list) return;

  function openSite(row) {
    const site = ranked[Number(row.dataset.index)];
    if (!site) return;
    selectSite(site);
    closeDialog($("#ranking-dialog"));
  }

  list.addEventListener("click", (event) => {
    if (event.target.closest("[data-link]")) return;
    const row = event.target.closest(".ranking-row");
    if (row) openSite(row);
  });

  list.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const row = event.target.closest(".ranking-row");
    if (!row) return;
    event.preventDefault();
    openSite(row);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  theme = storedTheme();
  applyTheme(theme, { persist: false });

  await initBackend();
  await loadData();

  function openWorld(world) {
    $("#welcome")?.classList.add("hidden");
    $("#app")?.classList.remove("hidden");
    if (!map) initMap();
    setWorld(world);
    refreshMap();
    setTimeout(refreshMap, 250);
  }

  function showOverview() {
    $("#app")?.classList.add("hidden");
    $("#welcome")?.classList.remove("hidden");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  document.querySelectorAll("[data-world]").forEach((button) => {
    button.addEventListener("click", () => openWorld(button.dataset.world));
  });

  $("#back-to-overview")?.addEventListener("click", showOverview);

  $("#start-exploring")?.addEventListener("click", () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    $("#worlds")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  });

  document.querySelectorAll("[data-theme-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      applyTheme(theme === "dark" ? "light" : "dark");
    });
  });

  $("#target-select")?.addEventListener("change", (event) => {
    const value = event.target.value;
    const note = $("#target-note");

    if (value === "custom" && customTarget) {
      activeTarget = customTarget;
      if (note) {
        const count = customTarget.evaluados ?? targetCoverage(customTarget);
        note.textContent = `Custom target · ${count} parameter${count === 1 ? "" : "s"} defined`;
        note.hidden = false;
      }
    } else {
      activeTarget = targetFor(activeWorld)[Number(value)] || null;
      if (note) {
        note.hidden = true;
        note.textContent = "";
      }
    }

    updateTargetFacts();
    rankAndRender();
  });

  $("#custom-target")?.addEventListener("click", setupCustom);
  $("#custom-form")?.addEventListener("submit", handleCustomSubmit);

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest("dialog")));
  });

  $("#close-detail")?.addEventListener("click", () => {
    $("#detail-panel")?.classList.remove("open");
    selectedSite = null;
    updateMarkerSelection();
    highlightRankingSelection();
  });

  $("#ranking-button")?.addEventListener("click", () => {
    renderRanking();
    const dialog = $("#ranking-dialog");
    if (dialog && !dialog.open) dialog.showModal();
  });

  $("#close-ranking")?.addEventListener("click", () =>
    closeDialog($("#ranking-dialog")),
  );

  $("#ranking-limit")?.addEventListener("change", renderRanking);

  bindRankingList();

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const panel = $("#detail-panel");
    if (panel?.classList.contains("open")) {
      panel.classList.remove("open");
      selectedSite = null;
      updateMarkerSelection();
      highlightRankingSelection();
    }
  });
});
