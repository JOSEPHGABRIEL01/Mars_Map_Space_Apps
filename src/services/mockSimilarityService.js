/**
 * Mock similarity service.
 *
 * Computes the DEMO compatibility between a planetary feature and the Earth
 * locations in the dataset. Scores come from the curated demo matches and are
 * adjusted when the feature was inferred from coordinates.
 *
 * When the backend is connected, this module is replaced by a real API call;
 * the rest of the UI keeps the same result shape.
 */

import { DEMO_LATENCY_MS, getAnalogsForFeature, getFeatureById } from '../data/index.js'
import { clampSimilarity, filterByMinimumSimilarity, sortBySimilarity } from '../utils/similarity.js'

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

/**
 * Pure, synchronous scoring function. Exported so the validation script and
 * future unit tests can check it without timers.
 */
export function calculateEarthAnalogues(feature, minimumSimilarity = 0) {
  const baseFeatureId = feature?.baseFeatureId ?? feature?.id
  const baseFeature = getFeatureById(baseFeatureId)
  if (!baseFeature) return []

  const penalty = Number.isFinite(feature.scorePenalty) ? feature.scorePenalty : 0
  const rationalePrefix = feature.rationalePrefix ? `${feature.rationalePrefix} ` : ''

  const analogs = getAnalogsForFeature(baseFeatureId).map((analog) => ({
    ...analog,
    similarity: clampSimilarity(analog.similarity - penalty),
    rationale: `${rationalePrefix}${analog.rationale}`.trim(),
  }))

  return sortBySimilarity(filterByMinimumSimilarity(analogs, minimumSimilarity))
}

/**
 * Async wrapper used by the UI. `minimumSimilarity` defaults to 0 so the
 * threshold can be adjusted on the client without re-running the analysis.
 */
export async function getEarthAnalogues(feature, minimumSimilarity = 0, { signal } = {}) {
  await wait(DEMO_LATENCY_MS)
  throwIfAborted(signal)
  return calculateEarthAnalogues(feature, minimumSimilarity)
}
