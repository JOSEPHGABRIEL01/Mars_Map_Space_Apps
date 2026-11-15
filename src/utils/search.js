/**
 * Text search helpers for planetary features.
 *
 * The search is intentionally simple and deterministic:
 *   1. Normalise the query (lower case, no accents, collapsed spaces).
 *   2. Compare it against the feature name, aliases, type and location label.
 *   3. Rank exact matches above prefix matches, and those above partial/token
 *      matches.
 *
 * The same function can be reused on the backend or replaced by a real
 * name-resolution service later.
 */

/** Lower case, remove diacritics and collapse whitespace. */
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function searchableStrings(feature) {
  return [
    feature.name,
    feature.type,
    feature.locationLabel,
    ...(feature.aliases ?? []),
  ].filter(Boolean)
}

/** Score how well a feature matches a query (0 = no match, 100 = exact). */
export function scoreFeatureMatch(feature, query) {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return 0

  const tokens = normalizedQuery.split(' ').filter(Boolean)
  let bestScore = 0

  for (const candidate of searchableStrings(feature)) {
    const normalizedCandidate = normalizeText(candidate)

    if (normalizedCandidate === normalizedQuery) {
      bestScore = Math.max(bestScore, 100)
      continue
    }

    if (normalizedCandidate.startsWith(normalizedQuery)) {
      bestScore = Math.max(bestScore, 90)
      continue
    }

    if (normalizedCandidate.includes(normalizedQuery)) {
      bestScore = Math.max(bestScore, 75)
      continue
    }

    if (tokens.length > 1 && tokens.every((token) => normalizedCandidate.includes(token))) {
      bestScore = Math.max(bestScore, 60)
    }
  }

  return bestScore
}

/**
 * Return the features matching a query, best match first.
 * Ties are resolved alphabetically to keep the UI stable.
 */
export function searchFeatures(features, query) {
  return features
    .map((feature) => ({ feature, score: scoreFeatureMatch(feature, query) }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.feature.name.localeCompare(b.feature.name) ||
        a.feature.id.localeCompare(b.feature.id),
    )
    .map((entry) => entry.feature)
}
