/**
 * Public data API.
 *
 * Components and services should import from this module instead of the
 * individual data files. When the real NASA dataset is connected, the
 * selectors can be backed by fetch calls without changing the UI.
 */

import { CELESTIAL_BODIES } from './celestialBodies.js'
import { EARTH_LOCATIONS } from './earthLocations.js'
import { PLANETARY_FEATURES } from './planetaryFeatures.js'
import { REGIONS } from './regions.js'
import { sortBySimilarity } from '../utils/similarity.js'

export { CELESTIAL_BODIES, EARTH_LOCATIONS, PLANETARY_FEATURES, REGIONS }
export {
  DATA_DISCLAIMER,
  DEFAULT_MINIMUM_SIMILARITY,
  DEMO_LATENCY_MS,
  MINIMUM_SIMILARITY_RANGE,
} from './config.js'
export {
  COORDINATE_SYSTEMS,
  getCoordinateSystem,
  normalizeLongitude,
  validatePlanetaryCoordinate,
} from './coordinateSystems.js'

export function getBodyById(bodyId) {
  return CELESTIAL_BODIES.find((body) => body.id === bodyId) ?? null
}

export function getFeaturesByBody(bodyId) {
  return PLANETARY_FEATURES.filter((feature) => feature.bodyId === bodyId)
}

export function getFeatureById(featureId) {
  return PLANETARY_FEATURES.find((feature) => feature.id === featureId) ?? null
}

export function getBodyForFeature(featureId) {
  const feature = getFeatureById(featureId)
  return feature ? getBodyById(feature.bodyId) : null
}

export function getEarthLocationById(locationId) {
  return EARTH_LOCATIONS.find((location) => location.id === locationId) ?? null
}

/**
 * Earth analogues of one planetary feature, highest similarity first.
 * Each item is a location object extended with `similarity`, `rationale`
 * and the feature it was matched against.
 */
export function getAnalogsForFeature(featureId) {
  const feature = getFeatureById(featureId)
  if (!feature) return []

  const analogs = EARTH_LOCATIONS.flatMap((location) =>
    location.matches
      .filter((match) => match.regionId === featureId)
      .map((match) => ({
        ...location,
        similarity: match.similarity,
        rationale: match.rationale,
        featureId: feature.id,
        featureName: feature.name,
        demo: true,
      })),
  )

  return sortBySimilarity(analogs)
}

/** Features of a body that have at least one Earth analogue. */
export function getFeaturesWithAnalogs(bodyId) {
  return getFeaturesByBody(bodyId).filter((feature) => getAnalogsForFeature(feature.id).length > 0)
}

/** Demo counters used by the welcome screen. */
export function getDemoStats() {
  return {
    celestialBodies: CELESTIAL_BODIES.length,
    features: PLANETARY_FEATURES.length,
    earthLocations: EARTH_LOCATIONS.length,
  }
}
