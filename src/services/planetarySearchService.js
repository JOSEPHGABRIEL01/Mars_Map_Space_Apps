/**
 * Planetary search service — the only entry point the UI should use.
 *
 * Today it resolves names and coordinates against the DEMO dataset. When the
 * backend is ready, these functions can be re-implemented with fetch calls and
 * the components will keep working, provided the response shapes stay stable.
 *
 * Shapes are documented in docs/api-contract.md.
 */

import {
  DEMO_LATENCY_MS,
  getBodyById,
  getCoordinateSystem,
  getFeaturesByBody,
  getFeatureById,
  validatePlanetaryCoordinate,
} from '../data/index.js'
import {
  angularDistanceDeg,
  angularDistanceToKm,
  formatCoordinates,
} from '../utils/geo.js'
import { searchFeatures } from '../utils/search.js'
import { getEarthAnalogues } from './mockSimilarityService.js'

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const error = new Error('Request aborted')
    error.name = 'AbortError'
    throw error
  }
}

function findNearestFeature(bodyId, lat, lng) {
  const features = getFeaturesByBody(bodyId)
  if (features.length === 0) return null

  return features.reduce((nearest, feature) => {
    const distance = angularDistanceDeg(
      { lat, lng },
      { lat: feature.coordinates.lat, lng: feature.coordinates.lng },
    )
    if (!nearest || distance < nearest.distanceDeg) {
      return { feature, distanceDeg: distance }
    }
    return nearest
  }, null)
}

/**
 * Search a Moon/Mars feature by name or alias.
 *
 * @returns {Promise<{ query: string, features: object[] }>}
 */
export async function searchPlanetaryFeatures(bodyId, query, { signal } = {}) {
  await wait(DEMO_LATENCY_MS)
  throwIfAborted(signal)

  if (!getBodyById(bodyId)) {
    throw new Error('Unknown celestial body. Select Moon or Mars first.')
  }

  const trimmed = String(query ?? '').trim()
  if (!trimmed) {
    return { query: trimmed, features: [] }
  }

  return {
    query: trimmed,
    features: searchFeatures(getFeaturesByBody(bodyId), trimmed),
  }
}

/**
 * Build a DEMO planetary feature from user-provided coordinates.
 *
 * The profile is inferred from the closest known demo feature so that the
 * similarity engine can return results, but the UI always labels it as a
 * user-defined demo target. Coordinates are validated against the body's
 * coordinate system.
 *
 * @returns {Promise<object>}
 */
export async function analyzePlanetaryCoordinates(
  bodyId,
  latitude,
  longitude,
  { signal } = {},
) {
  await wait(DEMO_LATENCY_MS)
  throwIfAborted(signal)

  const body = getBodyById(bodyId)
  if (!body) {
    throw new Error('Unknown celestial body. Select Moon or Mars first.')
  }

  const validation = validatePlanetaryCoordinate(bodyId, latitude, longitude)
  if (!validation.ok) {
    throw new Error(validation.error)
  }

  const { lat, lng } = validation
  const nearest = findNearestFeature(bodyId, lat, lng)

  if (!nearest) {
    throw new Error('No demo features are available for this celestial body yet.')
  }

  const { feature: baseFeature, distanceDeg } = nearest
  const distanceKm = Math.round(angularDistanceToKm(distanceDeg, body.meanRadiusKm))

  // The further the custom point is from a known feature, the lower the
  // confidence of the inferred profile (capped so results remain useful).
  const scorePenalty = Math.min(25, Math.round((distanceKm / body.meanRadiusKm) * 40))
  const coordinateLabel = formatCoordinates(lat, lng)

  return {
    id: `custom-${bodyId}-${lat.toFixed(3)}-${lng.toFixed(3)}`,
    bodyId,
    name: `Custom target · ${coordinateLabel}`,
    locationLabel: 'User-defined coordinates',
    type: 'Coordinate-based demo target',
    summary: `Custom ${body.name} target at ${coordinateLabel}. The demo profile is inferred from ${baseFeature.name}, the closest known feature (≈${distanceKm.toLocaleString('en-US')} km away).`,
    highlights: ['User-defined target', `Nearest demo feature: ${baseFeature.name}`],
    aliases: [],
    missionContext: 'User-defined exploration target.',
    profile: `This target was generated from coordinates for demo purposes. Its terrain profile is inferred from ${baseFeature.name}, so the compatibility scores are indicative only.`,
    dataLayers: baseFeature.dataLayers,
    coordinates: { lat, lng },
    isCustom: true,
    baseFeatureId: baseFeature.id,
    baseFeatureName: baseFeature.name,
    distanceKm,
    scorePenalty,
    rationalePrefix: `Inferred from the nearest demo feature (${baseFeature.name}, ≈${distanceKm.toLocaleString('en-US')} km away).`,
    comment: validation.converted
      ? `Longitude was converted from the 0°–360° east convention to ${lng}°.`
      : null,
    coordinateSystem: getCoordinateSystem(bodyId),
    demo: true,
  }
}

/** Analyse a feature and return all Earth analogues, best match first. */
export async function analyzeFeatureAnalogues(
  feature,
  minimumSimilarity = 0,
  { signal } = {},
) {
  return getEarthAnalogues(feature, minimumSimilarity, { signal })
}

export { getFeatureById }
