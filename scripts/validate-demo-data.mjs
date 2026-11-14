/**
 * Data integrity check for the DEMO dataset.
 *
 * Run with: npm run validate:data
 *
 * Fails (exit code 1) when IDs are duplicated, a match points to a missing
 * region, coordinates are out of range, an image file is missing or a region
 * has no Earth analogue.
 */

import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  CELESTIAL_BODIES,
  EARTH_LOCATIONS,
  REGIONS,
  getMatchesForRegion,
} from '../src/data/index.js'
import {
  formatCoordinates,
  isValidCoordinate,
  latToYPercent,
  lngToXPercent,
  parseCoordinates,
} from '../src/utils/geo.js'
import { formatSimilarity, sortBySimilarity } from '../src/utils/similarity.js'

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
    `${label}.image exists`,
    existsSync(path.join(PUBLIC_DIR, body.image)),
    `Missing image for body ${body.id}: ${body.image}`,
  )
}

// ----------------------------------------------------------------- regions
checkIdUniqueness(CELESTIAL_BODIES, 'body')
checkIdUniqueness(REGIONS, 'region')
checkIdUniqueness(EARTH_LOCATIONS, 'location')

const bodyIds = new Set(CELESTIAL_BODIES.map((body) => body.id))
const regionIds = new Set(REGIONS.map((region) => region.id))

for (const region of REGIONS) {
  const label = `region(${region.id})`
  checkRequiredString(region, 'name', label)
  checkRequiredString(region, 'type', label)
  checkRequiredString(region, 'summary', label)
  check(
    `${label} references an existing body`,
    bodyIds.has(region.bodyId),
    `Region ${region.id} has unknown bodyId "${region.bodyId}"`,
  )
  check(
    `${label} has valid coordinates`,
    isValidCoordinate(region.coordinates?.lat, region.coordinates?.lng),
    `Region ${region.id} has invalid coordinates`,
  )
  check(
    `${label} has at least one highlight`,
    Array.isArray(region.highlights) && region.highlights.length > 0,
    `Region ${region.id} has no highlights`,
  )
}

// --------------------------------------------------------------- locations
for (const location of EARTH_LOCATIONS) {
  const label = `location(${location.id})`
  checkRequiredString(location, 'name', label)
  checkRequiredString(location, 'country', label)
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
    `Location ${location.id} has no region matches`,
  )

  const matchedRegions = new Set()
  for (const match of location.matches) {
    check(
      `${label} match ${match.regionId} exists`,
      regionIds.has(match.regionId),
      `Location ${location.id} matches unknown region "${match.regionId}"`,
    )
    check(
      `${label} match ${match.regionId} similarity is 0-100`,
      Number.isFinite(match.similarity) && match.similarity >= 0 && match.similarity <= 100,
      `Location ${location.id} has invalid similarity for ${match.regionId}`,
    )
    check(
      `${label} match ${match.regionId} is unique`,
      !matchedRegions.has(match.regionId),
      `Location ${location.id} matches region ${match.regionId} more than once`,
    )
    matchedRegions.add(match.regionId)
  }
}

for (const region of REGIONS) {
  check(
    `region(${region.id}) has at least one Earth analogue`,
    getMatchesForRegion(region.id).length > 0,
    `Region ${region.id} has no Earth analogue in the demo dataset`,
  )
}

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

// ----------------------------------------------------------------- summary
const regionCoverage = REGIONS.map((region) => ({
  id: region.id,
  analogs: getMatchesForRegion(region.id).length,
}))

console.log('')
console.log('Worlds Map — DEMO data validation')
console.log('─────────────────────────────────')
console.log(`Celestial bodies : ${CELESTIAL_BODIES.length}`)
console.log(`Regions          : ${REGIONS.length}`)
console.log(`Earth locations  : ${EARTH_LOCATIONS.length}`)
console.log(`Checks executed  : ${checks.length}`)
console.log('')
console.log('Earth analogues per region:')
for (const coverage of regionCoverage) {
  console.log(`  • ${coverage.id.padEnd(26)} ${coverage.analogs}`)
}

if (errors.length > 0) {
  console.error('')
  console.error(`❌ ${errors.length} problem(s) found:`)
  for (const error of errors) console.error(`   - ${error}`)
  process.exitCode = 1
} else {
  console.log('')
  console.log('✅ All checks passed. Dataset is consistent.')
}
