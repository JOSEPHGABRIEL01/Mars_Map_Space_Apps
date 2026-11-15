/**
 * Global front-end configuration for the DEMO prototype.
 *
 * All values are provisional until the backend contract is agreed. The
 * similarity threshold is intentionally isolated here so it can be changed
 * without touching the scoring or presentation logic.
 */

/** Extra text shown wherever demo data is displayed. */
export const DATA_DISCLAIMER =
  'DEMO DATA — planetary features, coordinates and similarity scores are simulated for front-end development and must not be presented as scientific evidence.'

/** Artificial delay used by the mock services so loading states are visible. */
export const DEMO_LATENCY_MS = 600

/** Minimum compatibility shown by default (spec: 70%). */
export const DEFAULT_MINIMUM_SIMILARITY = 70

/** Bounds for the minimum similarity control. */
export const MINIMUM_SIMILARITY_RANGE = {
  min: 0,
  max: 100,
  step: 1,
}
