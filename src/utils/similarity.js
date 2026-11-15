/** Similarity helpers shared by every screen. */

export const SIMILARITY_THRESHOLDS = {
  high: 80,
  medium: 60,
}

export function clampSimilarity(value) {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(Math.round(value), 0), 100)
}

/** Format a score for display, e.g. 82 -> "82%". */
export function formatSimilarity(value) {
  return `${clampSimilarity(value)}%`
}

/** Return a semantic tier used to colour badges later: high | medium | low. */
export function getSimilarityTier(value) {
  const score = clampSimilarity(value)
  if (score >= SIMILARITY_THRESHOLDS.high) return 'high'
  if (score >= SIMILARITY_THRESHOLDS.medium) return 'medium'
  return 'low'
}

/** Human-readable label for the tier. */
export function getSimilarityLabel(value) {
  const tier = getSimilarityTier(value)
  if (tier === 'high') return 'High similarity'
  if (tier === 'medium') return 'Moderate similarity'
  return 'Low similarity'
}

/**
 * Return a new array sorted by similarity, highest first.
 * Ties are resolved alphabetically by name to keep the UI stable.
 */
export function sortBySimilarity(items, key = 'similarity') {
  return [...items].sort((a, b) => {
    const difference = clampSimilarity(b[key]) - clampSimilarity(a[key])
    if (difference !== 0) return difference
    return String(a.name ?? a.id ?? '').localeCompare(String(b.name ?? b.id ?? ''))
  })
}

/** Return the highest-scoring item of a list, or null when empty. */
export function getBestMatch(items, key = 'similarity') {
  const sorted = sortBySimilarity(items, key)
  return sorted[0] ?? null
}

/**
 * Keep only the items whose similarity reaches the minimum threshold.
 * The threshold is clamped to 0–100 so callers cannot break the UI.
 */
export function filterByMinimumSimilarity(items, minimumSimilarity = 0) {
  const threshold = Number.isFinite(minimumSimilarity)
    ? Math.min(Math.max(minimumSimilarity, 0), 100)
    : 0

  return items.filter((item) => clampSimilarity(item.similarity) >= threshold)
}

