/**
 * Mock API layer.
 *
 * These functions simulate the future backend: they are asynchronous, add a
 * small artificial latency (so loading states are visible) and return the demo
 * data from `src/data`.
 *
 * When the real API exists, replace the bodies of these functions with fetch
 * calls. The component code should not need to change.
 */

import {
  DEMO_LATENCY_MS,
  EARTH_LOCATIONS,
  getMatchesForRegion,
  getRegionById,
} from '../data/index.js'
import { haversineDistanceKm, isValidCoordinate } from '../utils/geo.js'
import { clampSimilarity, sortBySimilarity } from '../utils/similarity.js'

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

/** Earth analogues for a selected Moon/Mars region. */
export async function fetchMatchesForRegion(regionId, { signal } = {}) {
  await wait(DEMO_LATENCY_MS)
  throwIfAborted(signal)

  if (!getRegionById(regionId)) {
    throw new Error(`Unknown region: ${regionId}`)
  }

  return getMatchesForRegion(regionId)
}

/**
 * DEMO analysis for manually entered coordinates.
 *
 * Scores are deterministic: the closer a demo location is to the input point,
 * the higher its similarity. Real scoring will come from the backend.
 */
export async function analyzeCoordinates({ lat, lng }, { signal } = {}) {
  await wait(DEMO_LATENCY_MS)
  throwIfAborted(signal)

  if (!isValidCoordinate(lat, lng)) {
    throw new Error('Coordinates are outside the valid range.')
  }

  const candidates = EARTH_LOCATIONS.map((location) => {
    const distanceKm = haversineDistanceKm({ lat, lng }, location)
    const bestMatch = [...location.matches].sort((a, b) => b.similarity - a.similarity)[0]
    const region = bestMatch ? getRegionById(bestMatch.regionId) : null

    // Closer locations score higher, keeping the demo results plausible.
    const proximityScore = 95 - Math.min(distanceKm / 350, 55)
    const similarity = clampSimilarity(proximityScore - (100 - (bestMatch?.similarity ?? 50)) * 0.15)

    return {
      locationId: location.id,
      name: location.name,
      country: location.country,
      image: location.image,
      lat: location.lat,
      lng: location.lng,
      distanceKm: Math.round(distanceKm),
      similarity,
      regionId: region?.id ?? null,
      regionName: region?.name ?? 'Unknown region',
      bodyId: region?.bodyId ?? null,
      rationale: bestMatch?.rationale ?? '',
      demo: true,
    }
  })

  return sortBySimilarity(candidates).slice(0, 3)
}
