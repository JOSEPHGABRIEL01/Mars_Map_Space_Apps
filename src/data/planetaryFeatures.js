/**
 * DEMO DATA — searchable planetary features.
 *
 * A "feature" is any Moon or Mars place the user can search for (crater, plain,
 * volcano, canyon, landing site…). The base geographic data comes from
 * `regions.js`; this module enriches it with search aliases, mission context,
 * a readable profile and the demo data layers the backend will eventually
 * provide.
 *
 * Every score in the application is DEMO data. Nothing here is a scientific
 * result.
 */

import { REGIONS } from './regions.js'

const FEATURE_ENRICHMENT = {
  // ------------------------------------------------------------------ Moon
  'moon-shackleton': {
    aliases: ['Shackleton', 'Shackleton crater', 'Lunar south pole', 'South pole', 'Moon south pole'],
    missionContext:
      'Candidate region for a permanent lunar south-pole base (Artemis context).',
    dataLayers: ['Elevation', 'Permanently shadowed regions', 'Water-ice potential', 'Surface temperature'],
  },
  'moon-mare-serenitatis': {
    aliases: ['Mare Serenitatis', 'Serenitatis', 'Sea of Serenity'],
    missionContext:
      'Basaltic plain relevant for future mare resource exploration and rover traverses.',
    dataLayers: ['Elevation', 'Basaltic composition', 'Regolith thickness', 'Albedo'],
  },
  'moon-mare-imbrium': {
    aliases: ['Mare Imbrium', 'Imbrium', 'Sea of Rains'],
    missionContext:
      'Lava-flooded impact basin used to study volcanic and impact history.',
    dataLayers: ['Elevation', 'Lava-flow boundaries', 'Crater density', 'Iron content'],
  },
  'moon-taurus-littrow': {
    aliases: ['Taurus-Littrow', 'Taurus Littrow', 'Apollo 17', 'Apollo 17 valley'],
    missionContext: 'Apollo 17 landing site and reference for valley exploration.',
    dataLayers: ['Elevation', 'Regolith properties', 'Boulder distribution', 'Sample chemistry'],
  },
  'moon-copernicus': {
    aliases: ['Copernicus', 'Copernicus crater'],
    missionContext: 'Reference complex crater for impact geology and ejecta studies.',
    dataLayers: ['Elevation', 'Central peak morphology', 'Ejecta distribution', 'Surface roughness'],
  },
  'moon-south-pole-aitken': {
    aliases: ['South Pole-Aitken', 'South Pole Aitken', 'SPA basin', 'Aitken basin'],
    missionContext:
      'Deep far-side basin relevant for crustal composition and future resource studies.',
    dataLayers: ['Elevation', 'Crustal thickness', 'Mineralogy', 'Thorium abundance'],
  },

  // ------------------------------------------------------------------ Mars
  'mars-jezero': {
    aliases: ['Jezero', 'Jezero crater', 'Perseverance landing site'],
    missionContext: 'NASA Perseverance rover landing site (Mars 2020).',
    dataLayers: ['Elevation', 'Mineralogy', 'Paleolake sediments', 'Delta morphology'],
  },
  'mars-gale': {
    aliases: ['Gale', 'Gale crater', 'Mount Sharp', 'Aeolis Mons', 'Curiosity landing site'],
    missionContext: 'NASA Curiosity rover landing site and layered-mound study area.',
    dataLayers: ['Elevation', 'Sedimentary layers', 'Mineralogy', 'Atmospheric conditions'],
  },
  'mars-valles-marineris': {
    aliases: ['Valles Marineris', 'Mariner Valley', 'Marineris'],
    missionContext: 'Canyon system relevant for stratigraphy and future traverses.',
    dataLayers: ['Elevation', 'Canyon walls', 'Landslide deposits', 'Sulfate minerals'],
  },
  'mars-olympus-mons': {
    aliases: ['Olympus Mons', 'Olympus', 'Mount Olympus'],
    missionContext: 'Volcanic province relevant for terrain and resource studies.',
    dataLayers: ['Elevation', 'Lava flows', 'Caldera morphology', 'Surface age'],
  },
  'mars-utopia-planitia': {
    aliases: ['Utopia Planitia', 'Utopia', 'Viking 2 landing site'],
    missionContext: 'Northern plain and Viking 2 landing region; subsurface-ice studies.',
    dataLayers: ['Elevation', 'Polygonal terrain', 'Subsurface ice', 'Sediment thickness'],
  },
  'mars-argyre-planitia': {
    aliases: ['Argyre Planitia', 'Argyre', 'Argyre basin'],
    missionContext: 'Southern impact basin with past water and glacial features.',
    dataLayers: ['Elevation', 'Impact rings', 'Glacial features', 'Mineralogy'],
  },
}

const DEFAULT_DATA_LAYERS = ['Elevation', 'Surface composition', 'Terrain roughness']

export const PLANETARY_FEATURES = REGIONS.map((region) => {
  const enrichment = FEATURE_ENRICHMENT[region.id] ?? {}

  return {
    ...region,
    aliases: enrichment.aliases ?? [region.name],
    missionContext: enrichment.missionContext ?? 'Demo exploration target.',
    profile: enrichment.profile ?? region.summary,
    dataLayers: enrichment.dataLayers ?? DEFAULT_DATA_LAYERS,
    isCustom: false,
    demo: true,
  }
})
