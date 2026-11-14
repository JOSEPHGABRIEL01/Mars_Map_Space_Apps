/**
 * Public data API.
 *
 * Components should import from this module instead of the individual data
 * files. When the backend arrives, the functions below can be replaced by
 * fetch calls without touching the UI.
 */

import { CELESTIAL_BODIES } from './celestialBodies.js'
import { EARTH_LOCATIONS } from './earthLocations.js'
import { REGIONS } from './regions.js'
import { sortBySimilarity } from '../utils/similarity.js'

export { CELESTIAL_BODIES, EARTH_LOCATIONS, REGIONS }
export {
  DATA_DISCLAIMER,
  DEMO_LATENCY_MS,
  EARTH_MAP_ASPECT_RATIO,
  EARTH_MAP_IMAGE,
} from './config.js'

export function getBodyById(bodyId) {
  return CELESTIAL_BODIES.find((body) => body.id === bodyId) ?? null
}

export function getRegionsByBody(bodyId) {
  return REGIONS.filter((region) => region.bodyId === bodyId)
}

export function getRegionById(regionId) {
  return REGIONS.find((region) => region.id === regionId) ?? null
}

export function getLocationById(locationId) {
  return EARTH_LOCATIONS.find((location) => location.id === locationId) ?? null
}

/** Body that owns a region, or null if the region does not exist. */
export function getBodyForRegion(regionId) {
  const region = getRegionById(regionId)
  return region ? getBodyById(region.bodyId) : null
}

/**
 * Earth analogues of one Moon/Mars region, highest similarity first.
 * Each item is a location object extended with `similarity`, `rationale`
 * and the region it was matched against.
 */
export function getMatchesForRegion(regionId) {
  const region = getRegionById(regionId)
  if (!region) return []

  const matches = EARTH_LOCATIONS.flatMap((location) =>
    location.matches
      .filter((match) => match.regionId === regionId)
      .map((match) => ({
        ...location,
        similarity: match.similarity,
        rationale: match.rationale,
      })),
  )

  return sortBySimilarity(matches)
}

/** Regions of a body that have at least one Earth analogue. */
export function getRegionsWithAnalogs(bodyId) {
  return getRegionsByBody(bodyId).filter((region) =>
    EARTH_LOCATIONS.some((location) =>
      location.matches.some((match) => match.regionId === region.id),
    ),
  )
}

/** Demo counters used by the welcome screen. */
export function getDemoStats() {
  return {
    celestialBodies: CELESTIAL_BODIES.length,
    regions: REGIONS.length,
    earthLocations: EARTH_LOCATIONS.length,
  }
}
