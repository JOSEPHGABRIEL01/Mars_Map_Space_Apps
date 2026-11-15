import { DATA_DISCLAIMER } from '../data'
import styles from './ChallengeFooter.module.css'

/**
 * Footer requested for the challenge deliverable: which challenge the team
 * chose, what the proposal is, and the permanent DEMO disclaimer.
 */
export default function ChallengeFooter() {
  return (
    <footer className={styles.footer} aria-labelledby="challenge-title">
      <div className={styles.grid}>
        <section className={styles.block}>
          <p className={styles.kicker}>NASA Space Apps Challenge</p>
          <h2 id="challenge-title" className={styles.title}>
            The challenge we chose
          </h2>
          <p className={styles.text}>
            Build an interactive experience that helps people explore the Moon and Mars by
            connecting planetary landscapes with the closest places on Earth. The goal is to make
            planetary science approachable and to show how terrestrial analogues support mission
            planning and public engagement.
          </p>
        </section>

        <section className={styles.block}>
          <p className={styles.kicker}>Our proposal</p>
          <h2 className={styles.title}>Worlds Map</h2>
          <p className={styles.text}>
            A search-first web app: choose the Moon or Mars, search a feature by name or enter
            coordinates, and instantly see Earth locations ranked by compatibility. Every result
            is tied to the map, includes the reason for the match, and can be explored without
            leaving the page.
          </p>
        </section>

        <section className={styles.block}>
          <p className={styles.kicker}>Team &amp; status</p>
          <h2 className={styles.title}>Prototype</h2>
          <ul className={styles.list}>
            <li>Frontend: React + Vite + React Leaflet</li>
            <li>Data: simulated NASA-style records (DEMO)</li>
            <li>Next step: connect the backend and real NASA datasets</li>
          </ul>
          <p className={styles.links}>
            <a href="https://www.spaceappschallenge.org/" target="_blank" rel="noreferrer">
              NASA Space Apps Challenge ↗
            </a>
          </p>
        </section>
      </div>

      <p className={styles.disclaimer}>{DATA_DISCLAIMER}</p>
    </footer>
  )
}
