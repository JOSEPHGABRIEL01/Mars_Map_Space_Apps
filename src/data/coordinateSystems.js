/**
 * Coordinate conventions for the Moon and Mars.
 *
 * DEMO POLICY
 * -----------
 * Both bodies use planetocentric coordinates with:
 *   - latitude  : -90 … 90   (positive north)
 *   - longitude : -180 … 180 (positive east)
 *
 * Real planetary products often publish longitude as 0 … 360 east (and Mars
 * sometimes uses planetographic rather than planetocentric latitude), so the
 * UI accepts 0 … 360 east as input and normalises it. The conversion is
 * documented here and surfaced in the coordinate form.
 */

export const COORDINATE_SYSTEMS = {
  moon: {
    bodyId: 'moon',
    label: 'Selenographic coordinates',
    latitudeRange: { min: -90, max: 90 },
    longitudeRange: { min: -180, max: 180 },
    convention:
      'Planetocentric latitude (−90° to 90°) and east-positive longitude (−180° to 180°).',
    inputNote:
      'Values from 0° to 360° east are accepted and converted to −180°…180°.',
  },
  mars: {
    bodyId: 'mars',
    label: 'Areographic coordinates',
    latitudeRange: { min: -90, max: 90 },
    longitudeRange: { min: -180, max: 180 },
    convention:
      'Planetocentric latitude (−90° to 90°) and east-positive longitude (−180° to 180°).',
    inputNote:
      'Some Mars datasets use planetographic longitude 0°–360° east; those values are converted to −180°…180° in this demo.',
  },
}

export function getCoordinateSystem(bodyId) {
  return COORDINATE_SYSTEMS[bodyId] ?? null
}

/**
 * Convert an east-positive longitude in the 0…360 convention to −180…180.
 * Values already inside −180…180 are returned unchanged.
 */
export function normalizeLongitude(longitude) {
  if (!Number.isFinite(longitude)) return longitude
  if (longitude > 180 && longitude <= 360) return longitude - 360
  return longitude
}

/**
 * Validate and normalise a coordinate for a given celestial body.
 *
 * @returns {{ ok: true, lat: number, lng: number, converted: boolean, system: object }
 *          | { ok: false, error: string }}
 */
export function validatePlanetaryCoordinate(bodyId, latitude, longitude) {
  const system = getCoordinateSystem(bodyId)
  if (!system) {
    return { ok: false, error: 'Select a celestial body before entering coordinates.' }
  }

  const lat = typeof latitude === 'string' ? Number(latitude) : latitude
  const rawLng = typeof longitude === 'string' ? Number(longitude) : longitude

  if (!Number.isFinite(lat) || !Number.isFinite(rawLng)) {
    return { ok: false, error: 'Latitude and longitude must be numeric values.' }
  }

  if (lat < system.latitudeRange.min || lat > system.latitudeRange.max) {
    return {
      ok: false,
      error: `Latitude must be between ${system.latitudeRange.min}° and ${system.latitudeRange.max}°.`,
    }
  }

  const lng = normalizeLongitude(rawLng)
  if (lng < system.longitudeRange.min || lng > system.longitudeRange.max) {
    return {
      ok: false,
      error: `Longitude must be between ${system.longitudeRange.min}° and ${system.longitudeRange.max}° (0°–360° east is also accepted).`,
    }
  }

  return {
    ok: true,
    lat,
    lng,
    converted: lng !== rawLng,
    system,
  }
}
