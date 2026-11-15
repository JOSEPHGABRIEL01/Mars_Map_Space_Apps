import { formatCoordinates } from '../utils/geo'
import styles from './FeatureProfile.module.css'

/**
 * "Curriculum" of the selected planetary feature: what it is, where it is,
 * why it matters for exploration and which data layers the analysis uses.
 */
export default function FeatureProfile({ feature, body, isAnalyzing = false, onAnalyze }) {
  if (!feature) return null

  const { lat, lng } = feature.coordinates

  return (
    <section className={styles.profile} aria-labelledby="feature-profile-title">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>
            {body.name} · {feature.locationLabel}
          </p>
          <h2 id="feature-profile-title" className={styles.title}>
            {feature.name}
          </h2>
          <p className={styles.type}>{feature.type}</p>
        </div>

        {feature.isCustom && <span className={styles.customTag}>User-defined target</span>}
      </header>

      <dl className={styles.facts}>
        <div>
          <dt>Coordinates</dt>
          <dd>{formatCoordinates(lat, lng)}</dd>
        </div>
        <div>
          <dt>Mission context</dt>
          <dd>{feature.missionContext}</dd>
        </div>
      </dl>

      <p className={styles.summary}>{feature.summary}</p>

      {feature.highlights?.length > 0 && (
        <div>
          <h3 className={styles.miniHeading}>Highlights</h3>
          <ul className={styles.tags}>
            {feature.highlights.map((highlight) => (
              <li key={highlight} className={styles.tag}>
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {feature.dataLayers?.length > 0 && (
        <div>
          <h3 className={styles.miniHeading}>Data layers used for comparison</h3>
          <ul className={styles.dataLayers}>
            {feature.dataLayers.map((layer) => (
              <li key={layer}>{layer}</li>
            ))}
          </ul>
        </div>
      )}

      {feature.comment && <p className={styles.conversionNote}>{feature.comment}</p>}

      {feature.isCustom && (
        <p className={styles.customNote} role="note">
          Profiles inferred from coordinates are a DEMO approximation and are not a scientific
          characterisation of this point.
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.analyzeButton} onClick={onAnalyze} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing data…' : 'Analyze Earth analogues →'}
        </button>
        <span className={styles.disclaimer}>Demo scoring · not scientific evidence</span>
      </div>
    </section>
  )
}
