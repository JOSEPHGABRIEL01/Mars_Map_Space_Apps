/**
 * Global front-end configuration.
 *
 * NOTE: Every value in this file is provisional until the Figma design and the
 * backend contract are finalised.
 */

/** Extra text shown wherever demo data is displayed. */
export const DATA_DISCLAIMER =
  'DEMO DATA — locations, coordinates and similarity scores are placeholders for front-end development and do not represent real scientific results.'

/** Earth map asset. Swap this for the final PNG exported from Figma. */
export const EARTH_MAP_IMAGE = '/images/earth-map.svg'

/** Width / height ratio of the Earth map image (equirectangular = 2). */
export const EARTH_MAP_ASPECT_RATIO = 2

/** Artificial delay used by the mock API so loading states can be tested. */
export const DEMO_LATENCY_MS = 600
