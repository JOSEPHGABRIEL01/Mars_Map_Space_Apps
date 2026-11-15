/**
 * Data integrity check for the DEMO dataset.
 *
 * Run with: npm run validate:data
 *
 * Fails (exit code 1) when IDs are duplicated, a feature/match/coordinate is
 * invalid, an image file is missing, the search ranking is wrong, the
 * similarity engine returns unsorted or out-of-range scores, or the threshold
 * filter does not behave as specified.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CELESTIAL_BODIES,
  DATA_DISCLAIMER,
  DEFAULT_MINIMUM_SIMILARITY,
  EARTH_LOCATIONS,
  MINIMUM_SIMILARITY_RANGE,
  PLANETARY_FEATURES,
  getAnalogsForFeature,
  getCoordinateSystem,
  getDemoStats,
  getFeaturesByBody,
  normalizeLongitude,
  validatePlanetaryCoordinate,
} from '../src/data/index.js'
import { calculateEarthAnalogues } from '../src/services/mockSimilarityService.js'
import {
  formatCoordinates,
  isValidCoordinate,
  latToYPercent,
  lngToXPercent,
  parseCoordinates,
} from '../src/utils/geo.js'
import { searchFeatures } from '../src/utils/search.js'
import {
  filterByMinimumSimilarity,
  formatSimilarity,
  sortBySimilarity,
} from '../src/utils/similarity.js'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PUBLIC_DIR = path.join(ROOT, 'public')

const errors = []
const checks = []

function check(description, condition, errorMessage) {
  checks.push(description)
  if (!condition) errors.push(errorMessage ?? description)
}

function checkRequiredString(item, field, label) {
  check(
    `${label}.${field} is a non-empty string`,
    typeof item[field] === 'string' && item[field].trim().length > 0,
    `${label}.${field} is missing or empty`,
  )
}

function checkIdUniqueness(items, label) {
  const ids = new Set()
  for (const item of items) {
    check(`${label} id "${item.id}" is unique`, !ids.has(item.id), `Duplicate ${label} id: ${item.id}`)
    ids.add(item.id)
  }
}

// ------------------------------------------------------------------ bodies
for (const body of CELESTIAL_BODIES) {
  const label = `body(${body.id})`
  checkRequiredString(body, 'name', label)
  checkRequiredString(body, 'tagline', label)
  checkRequiredString(body, 'description', label)
  check(
    `${label}.meanRadiusKm is positive`,
    Number.isFinite(body.meanRadiusKm) && body.meanRadiusKm > 0,
    `Body ${body.id} needs a positive meanRadiusKm`,
  )
  check(
    `${label}.image exists`,
    existsSync(path.join(PUBLIC_DIR, body.image)),
    `Missing image for body ${body.id}: ${body.image}`,
  )
}

// ----------------------------------------------------------------- features
checkIdUniqueness(CELESTIAL_BODIES, 'body')
checkIdUniqueness(PLANETARY_FEATURES, 'feature')
checkIdUniqueness(EARTH_LOCATIONS, 'location')

const bodyIds = new Set(CELESTIAL_BODIES.map((body) => body.id))
const featureIds = new Set(PLANETARY_FEATURES.map((feature) => feature.id))

for (const feature of PLANETARY_FEATURES) {
  const label = `feature(${feature.id})`

  checkRequiredString(feature, 'name', label)
  checkRequiredString(feature, 'type', label)
  checkRequiredString(feature, 'summary', label)
  checkRequiredString(feature, 'profile', label)
  checkRequiredString(feature, 'missionContext', label)

  check(
    `${label} references an existing body`,
    bodyIds.has(feature.bodyId),
    `Feature ${feature.id} has unknown bodyId "${feature.bodyId}"`,
  )
  check(
    `${label} has valid coordinates`,
    isValidCoordinate(feature.coordinates?.lat, feature.coordinates?.lng),
    `Feature ${feature.id} has invalid coordinates`,
  )
  check(
    `${label} has at least one highlight`,
    Array.isArray(feature.highlights) && feature.highlights.length > 0,
    `Feature ${feature.id} has no highlights`,
  )
  check(
    `${label} has at least one search alias`,
    Array.isArray(feature.aliases) && feature.aliases.length > 0,
    `Feature ${feature.id} has no search aliases`,
  )
  check(
    `${label} has data layers`,
    Array.isArray(feature.dataLayers) && feature.dataLayers.length > 0,
    `Feature ${feature.id} has no data layers`,
  )
  check(
    `${label} is not marked as custom`,
    feature.isCustom === false,
    `Demo feature ${feature.id} must not be marked isCustom`,
  )
  check(
    `${label} is flagged as demo data`,
    feature.demo === true,
    `Demo feature ${feature.id} must be flagged with demo: true`,
  )
}

// --------------------------------------------------------------- locations
for (const location of EARTH_LOCATIONS) {
  const label = `location(${location.id})`

  checkRequiredString(location, 'name', label)
  checkRequiredString(location, 'country', label)
  checkRequiredString(location, 'region', label)
  checkRequiredString(location, 'summary', label)

  check(
    `${label} has valid coordinates`,
    isValidCoordinate(location.lat, location.lng),
    `Location ${location.id} has invalid coordinates (${location.lat}, ${location.lng})`,
  )
  check(
    `${label} image exists`,
    typeof location.image === 'string' && existsSync(path.join(PUBLIC_DIR, location.image)),
    `Missing image for location ${location.id}: ${location.image}`,
  )
  check(
    `${label} has references`,
    Array.isArray(location.references) && location.references.length > 0,
    `Location ${location.id} has no references`,
  )
  check(
    `${label} references are valid`,
    location.references.every(
      (reference) =>
        typeof reference.label === 'string' &&
        reference.label.length > 0 &&
        /^https?:\/\//.test(reference.url ?? ''),
    ),
    `Location ${location.id} has a malformed reference`,
  )
  check(
    `${label} has at least one match`,
    Array.isArray(location.matches) && location.matches.length > 0,
    `Location ${location.id} has no feature matches`,
  )

  const matchedFeatures = new Set()
  for (const match of location.matches) {
    check(
      `${label} match ${match.regionId} exists`,
      featureIds.has(match.regionId),
      `Location ${location.id} matches unknown feature "${match.regionId}"`,
    )
    check(
      `${label} match ${match.regionId} similarity is 0-100`,
      Number.isFinite(match.similarity) && match.similarity >= 0 && match.similarity <= 100,
      `Location ${location.id} has invalid similarity for ${match.regionId}`,
    )
    check(
      `${label} match ${match.regionId} has a rationale`,
      typeof match.rationale === 'string' && match.rationale.trim().length > 0,
      `Location ${location.id} match ${match.regionId} has no rationale`,
    )
    check(
      `${label} match ${match.regionId} is unique`,
      !matchedFeatures.has(match.regionId),
      `Location ${location.id} matches feature ${match.regionId} more than once`,
    )
    matchedFeatures.add(match.regionId)
  }
}

for (const feature of PLANETARY_FEATURES) {
  check(
    `feature(${feature.id}) has at least one Earth analogue`,
    getAnalogsForFeature(feature.id).length > 0,
    `Feature ${feature.id} has no Earth analogue in the demo dataset`,
  )
}

// -------------------------------------------------------- coordinate systems
for (const bodyId of ['moon', 'mars']) {
  const system = getCoordinateSystem(bodyId)
  check(`coordinate system for ${bodyId} exists`, Boolean(system), `Missing coordinate system for ${bodyId}`)
  check(
    `coordinate system for ${bodyId} documents its convention`,
    typeof system?.convention === 'string' && system.convention.length > 0,
    `Coordinate system for ${bodyId} has no documented convention`,
  )
  check(
    `coordinate system for ${bodyId} has valid ranges`,
    system?.latitudeRange?.min === -90 &&
      system?.latitudeRange?.max === 90 &&
      system?.longitudeRange?.min === -180 &&
      system?.longitudeRange?.max === 180,
    `Coordinate system for ${bodyId} has unexpected ranges`,
  )
}

const validMoonCoordinate = validatePlanetaryCoordinate('moon', -89.9, 0)
check('validatePlanetaryCoordinate accepts a valid Moon coordinate', validMoonCoordinate.ok === true)
check(
  'validatePlanetaryCoordinate rejects latitude > 90',
  validatePlanetaryCoordinate('mars', 91, 0).ok === false,
)
check(
  'validatePlanetaryCoordinate rejects longitude < -180',
  validatePlanetaryCoordinate('mars', 0, -181).ok === false,
)
check(
  'validatePlanetaryCoordinate rejects longitude > 360',
  validatePlanetaryCoordinate('mars', 0, 361).ok === false,
)
check(
  'validatePlanetaryCoordinate accepts 0-360 east longitude',
  validatePlanetaryCoordinate('mars', 18.4, 226.2).ok === true,
)
check(
  'validatePlanetaryCoordinate converts 0-360 east longitude',
  validatePlanetaryCoordinate('mars', 18.4, 226.2).lng === -133.8,
)
check('normalizeLongitude converts 270 to -90', normalizeLongitude(270) === -90)
check('normalizeLongitude keeps -90 unchanged', normalizeLongitude(-90) === -90)
check(
  'validatePlanetaryCoordinate rejects non-numeric input',
  validatePlanetaryCoordinate('mars', 'north', 0).ok === false,
)

// -------------------------------------------------------------- name search
const marsFeatures = getFeaturesByBody('mars')
const moonFeatures = getFeaturesByBody('moon')

check(
  'search by exact name returns Olympus Mons first',
  searchFeatures(marsFeatures, 'Olympus Mons')[0]?.id === 'mars-olympus-mons',
)
check(
  'search is case-insensitive and partial',
  searchFeatures(marsFeatures, 'jezero')[0]?.id === 'mars-jezero',
)
check(
  'search resolves aliases',
  searchFeatures(marsFeatures, 'Perseverance landing site')[0]?.id === 'mars-jezero',
)
check(
  'search resolves Moon aliases',
  searchFeatures(moonFeatures, 'Apollo 17')[0]?.id === 'moon-taurus-littrow',
)
check(
  'search normalises accents',
  searchFeatures(moonFeatures, 'Taurus-Littrow')[0]?.id === 'moon-taurus-littrow',
)
check('search returns nothing for unknown text', searchFeatures(marsFeatures, 'zzzzzz').length === 0)
check('search ignores empty queries', searchFeatures(marsFeatures, '   ').length === 0)

// ------------------------------------------------------- similarity engine
const olympus = PLANETARY_FEATURES.find((feature) => feature.id === 'mars-olympus-mons')
const olympusAnalogues = calculateEarthAnalogues(olympus)

check('similarity engine returns results', olympusAnalogues.length > 0)
check(
  'similarity engine returns results in descending order',
  olympusAnalogues.every(
    (item, index) => index === 0 || item.similarity <= olympusAnalogues[index - 1].similarity,
  ),
)
check(
  'similarity engine returns scores within 0-100',
  olympusAnalogues.every((item) => item.similarity >= 0 && item.similarity <= 100),
)
check(
  'similarity engine includes the feature context',
  olympusAnalogues.every((item) => item.featureId === 'mars-olympus-mons'),
)
check(
  'similarity engine flags results as demo data',
  olympusAnalogues.every((item) => item.demo === true),
)

const customTarget = {
  ...olympus,
  id: 'custom-mars-0-0',
  isCustom: true,
  baseFeatureId: 'mars-olympus-mons',
  scorePenalty: 10,
  rationalePrefix: 'Inferred from the nearest demo feature.',
}
const customAnalogues = calculateEarthAnalogues(customTarget)
check(
  'coordinate-inferred targets apply the score penalty',
  customAnalogues.every((item, index) => item.similarity === olympusAnalogues[index].similarity - 10),
)
check(
  'coordinate-inferred targets prefix the rationale',
  customAnalogues.every((item) => item.rationale.startsWith('Inferred from the nearest demo feature.')),
)

// ----------------------------------------------------------- threshold logic
const sampleScores = [94, 87, 79, 68, 55].map((similarity, index) => ({ id: `s${index}`, similarity }))
const aboveDefault = filterByMinimumSimilarity(sampleScores, 70)
check(
  'threshold keeps only scores >= minimum',
  aboveDefault.length === 3 && aboveDefault.map((item) => item.similarity).join(',') === '94,87,79',
)
check(
  'threshold clamps values below 0',
  filterByMinimumSimilarity(sampleScores, -20).length === sampleScores.length,
)
check(
  'threshold clamps values above 100',
  filterByMinimumSimilarity(sampleScores, 120).length === 0,
)
check(
  `default minimum similarity is 70`,
  DEFAULT_MINIMUM_SIMILARITY === 70,
  `Expected DEFAULT_MINIMUM_SIMILARITY to be 70, got ${DEFAULT_MINIMUM_SIMILARITY}`,
)
check(
  'minimum similarity range is 0-100',
  MINIMUM_SIMILARITY_RANGE.min === 0 && MINIMUM_SIMILARITY_RANGE.max === 100,
)
check(
  'applying the default threshold keeps ordered results',
  filterByMinimumSimilarity(olympusAnalogues, DEFAULT_MINIMUM_SIMILARITY).every(
    (item, index, list) => index === 0 || item.similarity <= list[index - 1].similarity,
  ),
)

// --------------------------------------------------------------- utilities
check('formatCoordinates works', formatCoordinates(-23.5, -68.4) === '23.50° S, 68.40° W')
check('lngToXPercent is bounded', lngToXPercent(-180) === 0 && lngToXPercent(180) === 100)
check('latToYPercent is bounded', latToYPercent(90) === 0 && latToYPercent(-90) === 100)
check('parseCoordinates accepts signed pair', parseCoordinates('23.5, -68.4').ok === true)
check('parseCoordinates accepts hemispheres', parseCoordinates('23.5 S, 68.4 W').lat === -23.5)
check('parseCoordinates rejects one value', parseCoordinates('23.5').ok === false)
check('parseCoordinates rejects out-of-range latitude', parseCoordinates('100, 0').ok === false)
check('sortBySimilarity sorts descending', sortBySimilarity([{ similarity: 10 }, { similarity: 90 }])[0].similarity === 90)
check('formatSimilarity clamps', formatSimilarity(150) === '100%')
check(
  'demo disclaimer is explicit',
  /DEMO/i.test(DATA_DISCLAIMER) && /not.*scientific evidence/i.test(DATA_DISCLAIMER),
)

// ----------------------------------------------------------------- summary
const stats = getDemoStats()
const featureCoverage = PLANETARY_FEATURES.map((feature) => ({
  id: feature.id,
  analogs: getAnalogsForFeature(feature.id).length,
}))

console.log('')
console.log('Worlds Map — DEMO data validation')
console.log('─────────────────────────────────')
console.log(`Celestial bodies : ${CELESTIAL_BODIES.length}`)
console.log(`Features         : ${PLANETARY_FEATURES.length}`)
console.log(`Earth locations  : ${EARTH_LOCATIONS.length}`)
console.log(`Checks executed  : ${checks.length}`)
console.log('')
console.log('Earth analogues per feature:')
for (const coverage of featureCoverage) {
  console.log(`  • ${coverage.id.padEnd(28)} ${coverage.analogs}`)
}
console.log('')
console.log(`Demo stats       : ${JSON.stringify(stats)}`)

if (errors.length > 0) {
  console.error('')
  console.error(`❌ ${errors.length} problem(s) found:`)
  for (const error of errors) console.error(`   - ${error}`)
  process.exitCode = 1
} else {
  console.log('')
  console.log('✅ All checks passed. Dataset is consistent.')
}
