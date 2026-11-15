/**
 * Geographic helpers.
 *
 * The Earth map uses an equirectangular projection, so converting geographic
 * coordinates to percentages over the image is a linear operation.
 */

export const LAT_MIN = -90
export const LAT_MAX = 90
export const LNG_MIN = -180
export const LNG_MAX = 180

const EARTH_RADIUS_KM = 6371

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function isValidLatitude(lat) {
  return Number.isFinite(lat) && lat >= LAT_MIN && lat <= LAT_MAX
}

export function isValidLongitude(lng) {
  return Number.isFinite(lng) && lng >= LNG_MIN && lng <= LNG_MAX
}

export function isValidCoordinate(lat, lng) {
  return isValidLatitude(lat) && isValidLongitude(lng)
}

/** Horizontal position (0–100) of a longitude on an equirectangular map. */
export function lngToXPercent(lng) {
  return ((clamp(lng, LNG_MIN, LNG_MAX) + 180) / 360) * 100
}

/** Vertical position (0–100) of a latitude on an equirectangular map. */
export function latToYPercent(lat) {
  return ((LAT_MAX - clamp(lat, LAT_MIN, LAT_MAX)) / 180) * 100
}

/** Map a geographic coordinate to CSS-friendly percentages. */
export function projectToMap({ lat, lng }) {
  return {
    xPercent: lngToXPercent(lng),
    yPercent: latToYPercent(lat),
  }
}

/** Format a single coordinate value, e.g. 23.5 -> "23.50° S". */
export function formatCoordinateValue(value, axis, precision = 2) {
  const isLatitude = axis === 'lat'
  const hemisphere = isLatitude ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  return `${Math.abs(value).toFixed(precision)}° ${hemisphere}`
}

/** Format a full coordinate pair, e.g. "23.50° S, 68.40° W". */
export function formatCoordinates(lat, lng, precision = 2) {
  return `${formatCoordinateValue(lat, 'lat', precision)}, ${formatCoordinateValue(lng, 'lng', precision)}`
}

/**
 * Parse free-text coordinates entered by the user.
 *
 * Supported formats:
 *   "23.5, -68.4"        (latitude, longitude)
 *   "23.5 S, 68.4 W"     (with hemispheres)
 *   "68.4 W 23.5 S"      (hemisphere order does not matter)
 *   "23.5°, 68.4° W"
 *
 * @returns {{ ok: true, lat: number, lng: number } | { ok: false, error: string }}
 */
export function parseCoordinates(input) {
  const text = String(input ?? '')
    .replace(/[\u2212\u2013\u2014]/g, '-')
    .replace(/[°º]/g, ' ')
    .trim()

  if (!text) {
    return { ok: false, error: 'Enter a latitude and a longitude.' }
  }

  const matches = [...text.matchAll(/(-?\d+(?:\.\d+)?)\s*([NSEW])?/gi)]

  if (matches.length < 2) {
    return {
      ok: false,
      error: 'Use a format such as "23.5, -68.4" or "23.5 S, 68.4 W".',
    }
  }

  const [first, second] = matches.slice(0, 2).map((match) => ({
    value: Number.parseFloat(match[1]),
    hemisphere: (match[2] || '').toUpperCase(),
  }))

  if (first.hemisphere === 'E' || first.hemisphere === 'W') {
    return finishParsing(second.value, second.hemisphere, first.value, first.hemisphere)
  }

  return finishParsing(first.value, first.hemisphere, second.value, second.hemisphere)
}

function finishParsing(latValue, latHemisphere, lngValue, lngHemisphere) {
  if ((latHemisphere && latHemisphere !== 'N' && latHemisphere !== 'S') ||
      (lngHemisphere && lngHemisphere !== 'E' && lngHemisphere !== 'W')) {
    return {
      ok: false,
      error: 'Latitude must use N/S and longitude must use E/W.',
    }
  }

  const lat = latHemisphere === 'S' ? -Math.abs(latValue) : latValue
  const lng = lngHemisphere === 'W' ? -Math.abs(lngValue) : lngValue

  if (!isValidLatitude(lat)) {
    return { ok: false, error: 'Latitude must be between -90 and 90.' }
  }

  if (!isValidLongitude(lng)) {
    return { ok: false, error: 'Longitude must be between -180 and 180.' }
  }

  return { ok: true, lat, lng }
}

/** Great-circle distance in kilometres between two geographic points. */
export function haversineDistanceKm(a, b) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

/**
 * Angular distance in degrees between two coordinates on the same sphere.
 * Works for Earth, Moon and Mars (the radius is applied later if needed).
 */
export function angularDistanceDeg(a, b) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const lat1 = toRadians(a.lat)
  const lat2 = toRadians(b.lat)

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2

  return (2 * Math.asin(Math.min(1, Math.sqrt(h))) * 180) / Math.PI
}

/** Convert an angular distance in degrees to kilometres on a sphere. */
export function angularDistanceToKm(degrees, radiusKm) {
  return (degrees * Math.PI * radiusKm) / 180
}

