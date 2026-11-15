import { useState } from 'react'

import { getFeatureById } from '../data'
import CoordinateSearch from './CoordinateSearch'
import styles from './PlanetarySearch.module.css'

const MODE = {
  NAME: 'name',
  COORDINATES: 'coordinates',
}

const EXAMPLE_FEATURE_IDS = {
  moon: ['moon-shackleton', 'moon-copernicus', 'moon-mare-imbrium', 'moon-taurus-littrow'],
  mars: ['mars-olympus-mons', 'mars-jezero', 'mars-gale', 'mars-valles-marineris'],
}

export default function PlanetarySearch({
  body,
  status,
  candidates = [],
  onSearchByName,
  onAnalyzeCoordinates,
  onSelectCandidate,
}) {
  const [mode, setMode] = useState(MODE.NAME)
  const [query, setQuery] = useState('')
  const [formError, setFormError] = useState(null)

  const isBusy = status === 'searching' || status === 'analyzing'
  const examples = (EXAMPLE_FEATURE_IDS[body.id] ?? [])
    .map((featureId) => getFeatureById(featureId))
    .filter(Boolean)

  function handleSubmit(event) {
    event.preventDefault()

    if (!query.trim()) {
      setFormError('Enter the name of a Moon or Mars feature.')
      return
    }

    setFormError(null)
    onSearchByName(query.trim())
  }

  function handleExample(name) {
    setQuery(name)
    setFormError(null)
    onSearchByName(name)
  }

  return (
    <section className={styles.panel} aria-labelledby="search-title">
      <p className={styles.kicker}>Search {body.name}</p>
      <h2 id="search-title" className={styles.title}>
        Find a planetary feature
      </h2>

      <div className={styles.tabs} role="tablist" aria-label="Search mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === MODE.NAME}
          className={`${styles.tab} ${mode === MODE.NAME ? styles.tabActive : ''}`}
          onClick={() => setMode(MODE.NAME)}
        >
          By name
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === MODE.COORDINATES}
          className={`${styles.tab} ${mode === MODE.COORDINATES ? styles.tabActive : ''}`}
          onClick={() => setMode(MODE.COORDINATES)}
        >
          By coordinates
        </button>
      </div>

      {mode === MODE.NAME ? (
        <div role="tabpanel" aria-label="Search by name" className={styles.panelBody}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.label} htmlFor="feature-query">
              Feature name
            </label>

            <div className={styles.inputRow}>
              <input
                id="feature-query"
                className={styles.input}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={body.id === 'mars' ? 'e.g. Olympus Mons' : 'e.g. Shackleton Crater'}
                autoComplete="off"
                disabled={isBusy}
              />

              <button type="submit" className={styles.submit} disabled={isBusy}>
                {isBusy ? 'Searching…' : 'Search'}
              </button>
            </div>
          </form>

          {formError && (
            <p className={styles.error} role="alert">
              {formError}
            </p>
          )}

          <p className={styles.hint}>Try one of these:</p>
          <div className={styles.chips}>
            {examples.map((feature) => (
              <button
                key={feature.id}
                type="button"
                className={styles.chip}
                onClick={() => handleExample(feature.name)}
                disabled={isBusy}
              >
                {feature.name}
              </button>
            ))}
          </div>

          {candidates.length > 0 && (
            <div className={styles.candidates}>
              <p className={styles.candidatesTitle}>
                {candidates.length} matches found — select a feature:
              </p>

              <ul className={styles.candidateList}>
                {candidates.map((feature) => (
                  <li key={feature.id}>
                    <button
                      type="button"
                      className={styles.candidateButton}
                      onClick={() => onSelectCandidate(feature)}
                    >
                      <span className={styles.candidateName}>{feature.name}</span>
                      <span className={styles.candidateMeta}>
                        {feature.type} · {feature.locationLabel}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div role="tabpanel" aria-label="Search by coordinates" className={styles.panelBody}>
          <CoordinateSearch body={body} status={status} onSubmit={onAnalyzeCoordinates} />
        </div>
      )}
    </section>
  )
}
