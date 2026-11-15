import { useState } from 'react'

import { getCoordinateSystem, validatePlanetaryCoordinate } from '../data'
import styles from './CoordinateSearch.module.css'

export default function CoordinateSearch({ body, status, onSubmit }) {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [formError, setFormError] = useState(null)

  const system = getCoordinateSystem(body.id)
  const isBusy = status === 'searching' || status === 'analyzing'

  function handleSubmit(event) {
    event.preventDefault()

    const parsedLatitude = latitude.trim() === '' ? Number.NaN : Number(latitude)
    const parsedLongitude = longitude.trim() === '' ? Number.NaN : Number(longitude)
    const validation = validatePlanetaryCoordinate(body.id, parsedLatitude, parsedLongitude)

    if (!validation.ok) {
      setFormError(validation.error)
      return
    }

    setFormError(null)
    onSubmit({
      lat: validation.lat,
      lng: validation.lng,
      rawLng: parsedLongitude,
      converted: validation.converted,
    })
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="latitude">
            Latitude (°)
          </label>
          <input
            id="latitude"
            className={styles.input}
            type="number"
            inputMode="decimal"
            step="any"
            min={system?.latitudeRange.min}
            max={system?.latitudeRange.max}
            value={latitude}
            onChange={(event) => setLatitude(event.target.value)}
            placeholder="-90 to 90"
            disabled={isBusy}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="longitude">
            Longitude (°)
          </label>
          <input
            id="longitude"
            className={styles.input}
            type="number"
            inputMode="decimal"
            step="any"
            min={-180}
            max={360}
            value={longitude}
            onChange={(event) => setLongitude(event.target.value)}
            placeholder="-180 to 180, or 0 to 360 E"
            disabled={isBusy}
          />
        </div>

        <button type="submit" className={styles.submit} disabled={isBusy}>
          {isBusy ? 'Analyzing…' : 'Analyze coordinates'}
        </button>
      </form>

      {formError && (
        <p className={styles.error} role="alert">
          {formError}
        </p>
      )}

      {system && (
        <div className={styles.convention}>
          <p className={styles.conventionTitle}>{system.label}</p>
          <p>{system.convention}</p>
          <p className={styles.conventionNote}>{system.inputNote}</p>
        </div>
      )}
    </div>
  )
}
