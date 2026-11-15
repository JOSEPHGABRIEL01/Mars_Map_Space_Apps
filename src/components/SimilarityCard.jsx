import { formatCoordinates } from '../utils/geo'
import { formatSimilarity, getSimilarityLabel, getSimilarityTier } from '../utils/similarity'
import styles from './SimilarityCard.module.css'

/** One Earth analogue with its demo similarity score and rationale. */
export default function SimilarityCard({
  location,
  rank,
  isSelected = false,
  onSelect,
}) {
  const tier = getSimilarityTier(location.similarity)

  return (
    <li
      className={`${styles.card} ${styles[tier]} ${isSelected ? styles.selected : ''}`}
    >
      <button
        type="button"
        className={styles.button}
        aria-pressed={isSelected}
        onClick={() => onSelect?.(location.id)}
      >
        <span className={styles.rank} aria-hidden="true">
          {String(rank).padStart(2, '0')}
        </span>

        <img
          className={styles.image}
          src={location.image}
          alt={`Demo illustration of ${location.name}`}
          loading="lazy"
        />

        <span className={styles.body}>
          <span className={styles.nameRow}>
            <span className={styles.name}>{location.name}</span>
            <span className={styles.score}>{formatSimilarity(location.similarity)}</span>
          </span>

          <span className={styles.location}>
            {location.country} · {location.region}
          </span>

          <span className={styles.coordinates}>{formatCoordinates(location.lat, location.lng)}</span>

          <span className={styles.rationale}>{location.rationale}</span>

          <span className={styles.footer}>
            <span className={styles.tierLabel}>{getSimilarityLabel(location.similarity)}</span>
            <span className={styles.mapHint}>
              {isSelected ? 'Shown on map' : 'Show on map →'}
            </span>
          </span>
        </span>
      </button>
    </li>
  )
}
