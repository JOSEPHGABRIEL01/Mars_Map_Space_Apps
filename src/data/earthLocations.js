/**
 * DEMO DATA — Earth locations that work as analogs of Moon and Mars regions.
 *
 * ⚠️ Every similarity score, description and reference pairing is a placeholder
 * created for front-end development. Nothing here is a scientific result.
 *
 * Data model
 * ----------
 * id           unique slug
 * name         display name in English
 * country      country name
 * region       administrative region / area
 * lat, lng     geographic coordinates (decimal degrees, WGS84)
 * image        path inside /public (placeholder SVG until real photos arrive)
 * summary      one short paragraph for the detail panel
 * environment  short tags shown as chips
 * references   source links shown in the detail panel
 * matches      Moon/Mars regions this location is an analog of, with a DEMO
 *              similarity score (0–100) and a rationale
 */

export const EARTH_LOCATIONS = [
  {
    id: 'atacama-desert',
    name: 'Atacama Desert',
    country: 'Chile',
    region: 'Antofagasta Region',
    lat: -23.5,
    lng: -68.4,
    image: '/images/locations/atacama-desert.svg',
    summary:
      'One of the driest places on Earth, with salt flats, evaporite deposits and almost no vegetation. Its soils are frequently used to test instruments designed for Martian landscapes.',
    environment: ['Hyper-arid', 'High UV radiation', 'Saline soils'],
    references: [
      { label: 'Wikipedia — Atacama Desert', url: 'https://en.wikipedia.org/wiki/Atacama_Desert' },
      { label: 'NASA Earth Observatory', url: 'https://earthobservatory.nasa.gov/' },
    ],
    matches: [
      {
        regionId: 'mars-jezero',
        similarity: 82,
        rationale:
          'Dry, low-organic soils and ancient evaporites resemble the lakebed deposits expected in Jezero Crater.',
      },
      {
        regionId: 'mars-utopia-planitia',
        similarity: 74,
        rationale:
          'Flat sedimentary plains with subsurface salts offer a comparable setting to Utopia Planitia.',
      },
    ],
  },
  {
    id: 'mcmurdo-dry-valleys',
    name: 'McMurdo Dry Valleys',
    country: 'Antarctica',
    region: 'Victoria Land',
    lat: -77.5,
    lng: 162.0,
    image: '/images/locations/mcmurdo-dry-valleys.svg',
    summary:
      'A polar desert with no snow cover in most areas, permafrost soils and ephemeral meltwater streams. It is one of the most widely used Mars analogs on Earth.',
    environment: ['Polar desert', 'Permafrost', 'Katabatic winds'],
    references: [
      { label: 'Wikipedia — McMurdo Dry Valleys', url: 'https://en.wikipedia.org/wiki/McMurdo_Dry_Valleys' },
      { label: 'NASA Earth Observatory', url: 'https://earthobservatory.nasa.gov/' },
    ],
    matches: [
      {
        regionId: 'mars-jezero',
        similarity: 78,
        rationale:
          'Cold, dry soils and seasonal meltwater channels mirror the ancient hydrological setting of Jezero.',
      },
      {
        regionId: 'mars-gale',
        similarity: 71,
        rationale:
          'Permafrost and layered sediments provide an analogue for the sedimentary record of Gale Crater.',
      },
      {
        regionId: 'moon-shackleton',
        similarity: 76,
        rationale:
          'Permanently cold, shadowed terrain with ice-rich ground resembles polar lunar craters.',
      },
    ],
  },
  {
    id: 'devon-island',
    name: 'Devon Island',
    country: 'Canada',
    region: 'Nunavut',
    lat: 75.3,
    lng: -89.7,
    image: '/images/locations/devon-island.svg',
    summary:
      'A polar desert containing the Haughton impact structure. Its barren terrain and crater geology make it a long-running training ground for Mars mission simulations.',
    environment: ['Polar desert', 'Impact crater', 'Permafrost'],
    references: [
      { label: 'Wikipedia — Devon Island', url: 'https://en.wikipedia.org/wiki/Devon_Island' },
      { label: 'NASA — Haughton-Mars Project', url: 'https://www.nasa.gov/' },
    ],
    matches: [
      {
        regionId: 'mars-jezero',
        similarity: 85,
        rationale:
          'An impact crater in a cold desert with polygonal ground and dry valleys closely matches Jezero’s terrain.',
      },
      {
        regionId: 'moon-copernicus',
        similarity: 69,
        rationale:
          'The Haughton structure exposes impact breccias and ejected material similar to complex lunar craters.',
      },
    ],
  },
  {
    id: 'lanzarote',
    name: 'Lanzarote',
    country: 'Spain',
    region: 'Canary Islands',
    lat: 29.03,
    lng: -13.63,
    image: '/images/locations/lanzarote.svg',
    summary:
      'A volcanic island with recent basaltic lava fields, cinder cones and lava tubes. Its dry climate keeps volcanic structures exceptionally well preserved.',
    environment: ['Volcanic', 'Basaltic lava', 'Arid'],
    references: [
      { label: 'Wikipedia — Lanzarote', url: 'https://en.wikipedia.org/wiki/Lanzarote' },
      { label: 'UNESCO — Lanzarote', url: 'https://whc.unesco.org/en/list/1039/' },
    ],
    matches: [
      {
        regionId: 'mars-olympus-mons',
        similarity: 77,
        rationale:
          'Basaltic lava flows and shield-volcano structures are comparable to the flanks of Olympus Mons.',
      },
      {
        regionId: 'moon-mare-serenitatis',
        similarity: 73,
        rationale:
          'Flat basaltic plains with low albedo resemble the lunar maria at a smaller scale.',
      },
    ],
  },
  {
    id: 'mauna-kea',
    name: 'Mauna Kea',
    country: 'United States',
    region: 'Hawaii',
    lat: 19.82,
    lng: -155.47,
    image: '/images/locations/mauna-kea.svg',
    summary:
      'A dormant shield volcano rising almost 4,200 m above sea level. Its summit has thin air, high UV exposure and volcanic terrain with very little vegetation.',
    environment: ['High altitude', 'Volcanic', 'Thin atmosphere'],
    references: [
      { label: 'Wikipedia — Mauna Kea', url: 'https://en.wikipedia.org/wiki/Mauna_Kea' },
      { label: 'USGS — Hawaiian Volcano Observatory', url: 'https://www.usgs.gov/observatories/hvo' },
    ],
    matches: [
      {
        regionId: 'mars-olympus-mons',
        similarity: 80,
        rationale:
          'A large basaltic shield volcano with gentle slopes is a close morphological analog to Olympus Mons.',
      },
      {
        regionId: 'moon-taurus-littrow',
        similarity: 71,
        rationale:
          'Rocky volcanic terrain, loose material and boulder fields resemble the Apollo 17 valley.',
      },
    ],
  },
  {
    id: 'teide',
    name: 'Teide Volcano',
    country: 'Spain',
    region: 'Tenerife, Canary Islands',
    lat: 28.27,
    lng: -16.64,
    image: '/images/locations/teide.svg',
    summary:
      'A stratovolcano inside a large caldera, surrounded by lava flows and pumice fields. Its high-altitude volcanic landscape is often used for planetary field tests.',
    environment: ['Volcanic', 'High altitude', 'Caldera'],
    references: [
      { label: 'Wikipedia — Teide', url: 'https://en.wikipedia.org/wiki/Teide' },
      { label: 'UNESCO — Teide National Park', url: 'https://whc.unesco.org/en/list/1188/' },
    ],
    matches: [
      {
        regionId: 'mars-olympus-mons',
        similarity: 75,
        rationale:
          'Stacked lava flows and a summit caldera reproduce the volcanic architecture of Martian shields.',
      },
      {
        regionId: 'moon-copernicus',
        similarity: 68,
        rationale:
          'Central peaks and terraced caldera walls offer a structural comparison with complex craters.',
      },
    ],
  },
  {
    id: 'rio-tinto',
    name: 'Río Tinto',
    country: 'Spain',
    region: 'Andalusia',
    lat: 37.69,
    lng: -6.59,
    image: '/images/locations/rio-tinto.svg',
    summary:
      'A river with extremely acidic, iron-rich water and a subsurface biosphere of extremophiles. It is a reference site for studying potential Martian life.',
    environment: ['Acidic water', 'Iron-rich', 'Extremophile habitat'],
    references: [
      { label: 'Wikipedia — Río Tinto', url: 'https://en.wikipedia.org/wiki/R%C3%ADo_Tinto_(river)' },
      { label: 'NASA Astrobiology', url: 'https://astrobiology.nasa.gov/' },
    ],
    matches: [
      {
        regionId: 'mars-jezero',
        similarity: 79,
        rationale:
          'Iron-rich sediments and acidic fluids provide a chemical analogue for Jezero’s clay-bearing deposits.',
      },
      {
        regionId: 'mars-gale',
        similarity: 72,
        rationale:
          'Layered mineral deposits formed in water resemble the sedimentary sequences of Gale Crater.',
      },
    ],
  },
  {
    id: 'svalbard',
    name: 'Svalbard',
    country: 'Norway',
    region: 'Arctic archipelago',
    lat: 78.22,
    lng: 15.65,
    image: '/images/locations/svalbard.svg',
    summary:
      'An Arctic desert with glaciers, permafrost and polar night. Its cold, dry and rocky terrain is used to test instruments and procedures for polar lunar missions.',
    environment: ['Arctic desert', 'Glaciers', 'Permafrost'],
    references: [
      { label: 'Wikipedia — Svalbard', url: 'https://en.wikipedia.org/wiki/Svalbard' },
      { label: 'Norwegian Polar Institute', url: 'https://www.npolar.no/en/' },
    ],
    matches: [
      {
        regionId: 'moon-shackleton',
        similarity: 74,
        rationale:
          'Polar light conditions and ice-rich permafrost resemble the permanently shadowed lunar south pole.',
      },
      {
        regionId: 'mars-utopia-planitia',
        similarity: 66,
        rationale:
          'Polygonal ground produced by subsurface ice matches the patterned terrain of Utopia Planitia.',
      },
    ],
  },
  {
    id: 'pilbara',
    name: 'Pilbara',
    country: 'Australia',
    region: 'Western Australia',
    lat: -22.6,
    lng: 118.6,
    image: '/images/locations/pilbara.svg',
    summary:
      'An arid region with some of the oldest exposed rocks on Earth and fossil stromatolites. It is a key analog for early planetary crusts and ancient life.',
    environment: ['Ancient crust', 'Stromatolites', 'Arid'],
    references: [
      { label: 'Wikipedia — Pilbara', url: 'https://en.wikipedia.org/wiki/Pilbara' },
      { label: 'NASA Astrobiology', url: 'https://astrobiology.nasa.gov/' },
    ],
    matches: [
      {
        regionId: 'moon-south-pole-aitken',
        similarity: 70,
        rationale:
          'Very old, deeply weathered crust offers a comparison with the exposed interior of the Aitken basin.',
      },
      {
        regionId: 'mars-gale',
        similarity: 68,
        rationale:
          'Fine-grained sedimentary rocks with ancient organic signatures parallel Gale’s mudstones.',
      },
    ],
  },
  {
    id: 'death-valley',
    name: 'Death Valley',
    country: 'United States',
    region: 'California',
    lat: 36.46,
    lng: -116.87,
    image: '/images/locations/death-valley.svg',
    summary:
      'The hottest and driest national park in the United States, with salt pans, alluvial fans and deeply weathered bedrock.',
    environment: ['Extreme heat', 'Saline basin', 'Alluvial fans'],
    references: [
      { label: 'Wikipedia — Death Valley', url: 'https://en.wikipedia.org/wiki/Death_Valley' },
      { label: 'National Park Service', url: 'https://www.nps.gov/deva/' },
    ],
    matches: [
      {
        regionId: 'mars-gale',
        similarity: 76,
        rationale:
          'Salt-rich sediments and dry alluvial deposits resemble the exposed layers at the base of Mount Sharp.',
      },
      {
        regionId: 'moon-mare-imbrium',
        similarity: 67,
        rationale:
          'Flat, dark, basalt-like surfaces with low relief are visually similar to lunar mare plains.',
      },
    ],
  },
  {
    id: 'holuhraun',
    name: 'Holuhraun',
    country: 'Iceland',
    region: 'Highlands',
    lat: 64.87,
    lng: -17.45,
    image: '/images/locations/holuhraun.svg',
    summary:
      'A young basaltic lava field formed by a fissure eruption in 2014–2015. Its fresh lava, sparse vegetation and glacial outwash plains make it a strong planetary analog.',
    environment: ['Basaltic lava', 'Glacial outwash', 'Geothermal'],
    references: [
      { label: 'Wikipedia — Holuhraun', url: 'https://en.wikipedia.org/wiki/Holuhraun' },
      { label: 'Icelandic Meteorological Office', url: 'https://en.vedur.is/' },
    ],
    matches: [
      {
        regionId: 'moon-mare-imbrium',
        similarity: 75,
        rationale:
          'Fresh basaltic flows and flat plains reproduce the appearance of lava-flooded lunar basins.',
      },
      {
        regionId: 'mars-olympus-mons',
        similarity: 70,
        rationale:
          'Fissure-fed lava fields are comparable to the youngest flows on Martian shield volcanoes.',
      },
      {
        regionId: 'moon-mare-serenitatis',
        similarity: 72,
        rationale:
          'Dark, low-albedo basalt surfaces closely match the optical signature of mare plains.',
      },
    ],
  },
  {
    id: 'craters-of-the-moon',
    name: 'Craters of the Moon',
    country: 'United States',
    region: 'Idaho',
    lat: 43.42,
    lng: -113.52,
    image: '/images/locations/craters-of-the-moon.svg',
    summary:
      'A volcanic field of cinder cones, spatter ramparts and lava tubes, named for its resemblance to lunar terrain. Apollo astronauts trained in the area.',
    environment: ['Basaltic lava', 'Cinder cones', 'Lava tubes'],
    references: [
      { label: 'Wikipedia — Craters of the Moon', url: 'https://en.wikipedia.org/wiki/Craters_of_the_Moon_National_Monument_and_Preserve' },
      { label: 'National Park Service', url: 'https://www.nps.gov/crmo/' },
    ],
    matches: [
      {
        regionId: 'moon-taurus-littrow',
        similarity: 72,
        rationale:
          'Lava tubes, loose volcanic material and boulder fields are comparable to the Apollo 17 landing valley.',
      },
      {
        regionId: 'moon-mare-serenitatis',
        similarity: 70,
        rationale:
          'Extensive basaltic plains and low relief are a small-scale version of lunar maria.',
      },
    ],
  },
  {
    id: 'vestfold-hills',
    name: 'Vestfold Hills',
    country: 'Antarctica',
    region: 'Princess Elizabeth Land',
    lat: -68.4,
    lng: 78.2,
    image: '/images/locations/vestfold-hills.svg',
    summary:
      'An ice-free oasis of exposed metamorphic rocks and saline lakes surrounded by the Antarctic ice sheet. Its geology records a long history of glaciation.',
    environment: ['Ice-free oasis', 'Metamorphic rocks', 'Saline lakes'],
    references: [
      { label: 'Wikipedia — Vestfold Hills', url: 'https://en.wikipedia.org/wiki/Vestfold_Hills' },
      { label: 'Australian Antarctic Program', url: 'https://www.antarctica.gov.au/' },
    ],
    matches: [
      {
        regionId: 'moon-south-pole-aitken',
        similarity: 69,
        rationale:
          'Exposed ancient basement rocks mirror the deep crustal material of the Aitken basin.',
      },
    ],
  },
  {
    id: 'grand-canyon',
    name: 'Grand Canyon',
    country: 'United States',
    region: 'Arizona',
    lat: 36.1,
    lng: -112.1,
    image: '/images/locations/grand-canyon.svg',
    summary:
      'A 446 km-long canyon exposing nearly two billion years of sedimentary and volcanic history through its walls and terraces.',
    environment: ['Canyon', 'Sedimentary layers', 'Arid'],
    references: [
      { label: 'Wikipedia — Grand Canyon', url: 'https://en.wikipedia.org/wiki/Grand_Canyon' },
      { label: 'National Park Service', url: 'https://www.nps.gov/grca/' },
    ],
    matches: [
      {
        regionId: 'mars-valles-marineris',
        similarity: 84,
        rationale:
          'A deep canyon with exposed layered walls and landslide deposits is the closest terrestrial analogue to Valles Marineris.',
      },
    ],
  },
  {
    id: 'colca-canyon',
    name: 'Colca Canyon',
    country: 'Peru',
    region: 'Arequipa',
    lat: -15.6,
    lng: -72.0,
    image: '/images/locations/colca-canyon.svg',
    summary:
      'One of the deepest canyons in the world, cut through volcanic and sedimentary rocks at high altitude, with terraced slopes and active geomorphology.',
    environment: ['Deep canyon', 'Volcanic rocks', 'High altitude'],
    references: [
      { label: 'Wikipedia — Colca Canyon', url: 'https://en.wikipedia.org/wiki/Colca_Canyon' },
      { label: 'UNESCO — Andes', url: 'https://whc.unesco.org/en/list/1170/' },
    ],
    matches: [
      {
        regionId: 'mars-valles-marineris',
        similarity: 76,
        rationale:
          'Steep canyon walls with layered volcanic sequences resemble the western troughs of Valles Marineris.',
      },
    ],
  },
  {
    id: 'ries-crater',
    name: 'Ries Crater',
    country: 'Germany',
    region: 'Bavaria',
    lat: 48.88,
    lng: 10.43,
    image: '/images/locations/ries-crater.svg',
    summary:
      'A 24 km-wide impact crater formed about 15 million years ago, now partly filled with sediments and surrounded by an ejecta blanket.',
    environment: ['Impact crater', 'Breccia', 'Sedimentary fill'],
    references: [
      { label: 'Wikipedia — Nördlinger Ries', url: 'https://en.wikipedia.org/wiki/N%C3%B6rdlinger_Ries' },
      { label: 'UNESCO — Ries Geopark', url: 'https://www.unesco.org/en/iggp' },
    ],
    matches: [
      {
        regionId: 'mars-argyre-planitia',
        similarity: 66,
        rationale:
          'A large impact basin with sedimentary infill is comparable to the structure of Argyre Planitia.',
      },
      {
        regionId: 'moon-copernicus',
        similarity: 65,
        rationale:
          'The crater’s rim, ejecta and fractured floor provide a small-scale analogue of Copernicus.',
      },
    ],
  },
]
