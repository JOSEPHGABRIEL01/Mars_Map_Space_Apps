import { MINIMUM_SIMILARITY_RANGE } from '../data'
import SimilarityCard from './SimilarityCard'
import styles from './SimilarityResults.module.css'

/**
 * Results panel: threshold control + ordered list of Earth analogues.
 * The threshold is applied outside the similarity engine, so moving the slider
 * never re-runs the analysis.
 */
export default function SimilarityResults({
  feature,
  body,
  results = [],
  totalResults = 0,
  threshold,
  selectedLocationId,
  isAnalyzing = false,
  errorMessage = null,
  onThresholdChange,
  onSelectLocation,
}) {
  const hiddenCount = Math.max(0, totalResults - results.length)

  return (
    <section className={styles.results} aria-labelledby="results-title">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Earth analogues · DEMO</p>
          <h2 id="results-title" className={styles.title}>
            {feature ? `Where on Earth is like ${feature.name}?` : 'Earth analogues'}
          </h2>
          <p className={styles.lead}>
            {feature
              ? `Locations on Earth whose terrain and environment most resemble this ${body.name} feature.`
              : 'Search for a feature or enter coordinates to compare it with Earth.'}
          </p>
        </div>

        <div className={styles.threshold}>
          <label className={styles.thresholdLabel} htmlFor="minimum-similarity">
            Minimum compatibility
          </label>

          <div className={styles.thresholdRow}>
            <input
              id="minimum-similarity"
              className={styles.slider}
              type="range"
              min={MINIMUM_SIMILARITY_RANGE.min}
              max={MINIMUM_SIMILARITY_RANGE.max}
              step={MINIMUM_SIMILARITY_RANGE.step}
              value={threshold}
              onChange={(event) => onThresholdChange?.(Number(event.target.value))}
              aria-valuetext={`${threshold} percent`}
            />
            <output className={styles.thresholdValue} htmlFor="minimum-similarity">
              {threshold}%
            </output>
          </div>

          <p className={styles.thresholdHint}>
            {results.length} of {totalResults} location{totalResults === 1 ? '' : 's'} pass this
            threshold
            {hiddenCount > 0 ? ` · ${hiddenCount} hidden` : ''}
          </p>
        </div>
      </header>

      {errorMessage && (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      )}

      {isAnalyzing && (
        <div className={styles.loading} role="status" aria-live="polite">
          <span className={styles.spinner} aria-hidden="true" />
          Comparing terrain, climate and geology with Earth locations…
        </div>
      )}

      {!isAnalyzing && feature && results.length === 0 && !errorMessage && (
        <div className={styles.empty} role="status">
          <h3>No analogues pass the threshold</h3>
          <p>
            {totalResults > 0
              ? `All ${totalResults} demo analogues score below ${threshold}%. Lower the minimum compatibility to see them.`
              : 'This feature has no Earth analogues in the demo dataset yet.'}
          </p>
        </div>
      )}

      {!isAnalyzing && results.length > 0 && (
        <ol className={styles.list}>
          {results.map((location, index) => (
            <SimilarityCard
              key={location.id}
              location={location}
              rank={index + 1}
              isSelected={location.id === selectedLocationId}
              onSelect={onSelectLocation}
            />
          ))}
        </ol>
      )}

      {!isAnalyzing && !feature && (
        <div className={styles.empty} role="status">
          <h3>No feature selected yet</h3>
          <p>Use the search panel to find a Moon or Mars feature and start the comparison.</p>
        </div>
      )}
    </section>
  )
}
