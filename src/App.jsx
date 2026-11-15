/**
 * Worlds Map — application shell.
 *
 * Flow:
 *   Welcome → Celestial body → Explorer (search / profile / results / map)
 *
 * The data and scoring logic live in src/services. This component only keeps
 * the high-level navigation state and renders the challenge footer.
 */

import { useRef, useState } from 'react'

import styles from './App.module.css'
import ChallengeFooter from './components/ChallengeFooter'
import Explorer from './components/Explorer'
import { CELESTIAL_BODIES, DATA_DISCLAIMER, getBodyById, getDemoStats } from './data'

const STAGE = {
  WELCOME: 'welcome',
  BODY: 'body',
  EXPLORER: 'explorer',
}

const DEMO_STATS = getDemoStats()

export default function App() {
  const [stage, setStage] = useState(STAGE.WELCOME)
  const [bodyId, setBodyId] = useState(null)
  const challengeRef = useRef(null)

  const body = bodyId ? getBodyById(bodyId) : null

  function startOver() {
    setBodyId(null)
    setStage(STAGE.WELCOME)
  }

  function selectBody(nextBodyId) {
    setBodyId(nextBodyId)
    setStage(STAGE.EXPLORER)
  }

  function goBack() {
    setStage(STAGE.BODY)
  }

  function scrollToChallenge() {
    challengeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={styles.app}>
      <p className={styles.banner} role="note">
        DEMO prototype — every feature, percentage and image is simulated for front-end
        development.
      </p>

      <header className={styles.header}>
        <button type="button" className={styles.brand} onClick={startOver}>
          Worlds Map
        </button>

        <nav className={styles.nav} aria-label="Main navigation">
          <button type="button" className={styles.navButton} onClick={startOver}>
            Home
          </button>
          <button type="button" className={styles.navButton} onClick={scrollToChallenge}>
            Challenge
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        {stage === STAGE.WELCOME && (
          <WelcomeStep stats={DEMO_STATS} onStart={() => setStage(STAGE.BODY)} />
        )}

        {stage === STAGE.BODY && (
          <BodyStep bodies={CELESTIAL_BODIES} onSelect={selectBody} onBack={startOver} />
        )}

        {stage === STAGE.EXPLORER && body && (
          <Explorer key={body.id} body={body} onBack={goBack} />
        )}
      </main>

      <div ref={challengeRef}>
        <ChallengeFooter />
      </div>

      <p className={styles.demoFooter}>{DATA_DISCLAIMER}</p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Welcome screen                                                             */
/* -------------------------------------------------------------------------- */

function WelcomeStep({ stats, onStart }) {
  return (
    <section className={`${styles.section} ${styles.welcome}`}>
      <div className={styles.welcomeContent}>
        <p className={styles.welcomeEyebrow}>
          NASA SPACE APPS CHALLENGE <span>•</span> DEMO
        </p>

        <h1 className={styles.welcomeTitle}>
          Discover Earth's
          <span> Other Worlds.</span>
        </h1>

        <p className={styles.welcomeDescription}>
          Explore terrestrial locations that resemble the landscapes
          of the Moon and Mars. Discover Earth's hidden analog worlds
          through science, geography and exploration.
        </p>

        <div className={styles.welcomeActions}>
          <button
            type="button"
            className={styles.welcomeButton}
            onClick={onStart}
          >
            Start Exploring <span aria-hidden="true">→</span>
          </button>
          <span className={styles.welcomeHint}>
            BEGIN YOUR EXPLORATION
          </span>
        </div>

        <ul className={styles.welcomeStats}>
          <li>
            <strong>{stats.celestialBodies}</strong>
            <span>Celestial bodies</span>
          </li>
          <li>
            <strong>{stats.features}</strong>
            <span>Searchable features</span>
          </li>
          <li>
            <strong>{stats.earthLocations}</strong>
            <span>Earth analogs</span>
          </li>
        </ul>
      </div>

      <div
        className={styles.welcomeVisual}
        role="img"
        aria-label="Illustration of the Moon, Earth and Mars in space"
      >
        <div className={styles.visualGlow} />
        <div className={`${styles.orbit} ${styles.orbitOne}`} />
        <div className={`${styles.orbit} ${styles.orbitTwo}`} />

        <div className={styles.moonPlanet}>
          <span>MOON</span>
        </div>

        <div className={styles.earthPlanet}>
          <span>EARTH</span>
        </div>

        <div className={styles.marsPlanet}>
          <span>MARS</span>
        </div>

        <div className={styles.visualCaption}>
          <span>01 — 03</span>
          <span>EXPLORE THE SOLAR SYSTEM</span>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Destination picker                                                         */
/* -------------------------------------------------------------------------- */

function BodyStep({ bodies, onSelect, onBack }) {
  return (
    <section className={`${styles.section} ${styles.bodySection}`}>
      <button type="button" className={styles.backButton} onClick={onBack}>
        ← Back
      </button>

      <div className={styles.bodyHeader}>
        <p className={styles.kicker}>WORLDS MAP · EXPLORATION</p>

        <h2 className={styles.bodyTitle}>
          Choose your <span>destination.</span>
        </h2>

        <p className={styles.lead}>
          Select a celestial body to search its landscapes
          and explore their terrestrial analogs.
        </p>
      </div>

      <div className={styles.celestialGrid}>
        {bodies.map((body, index) => (
          <button
            key={body.id}
            type="button"
            className={styles.celestialCard}
            onClick={() => onSelect(body.id)}
          >
            <img
              className={styles.celestialImage}
              src={body.image}
              alt={body.name}
            />

            <div className={styles.celestialOverlay} />

            <div className={styles.celestialInfo}>
              <span className={styles.celestialNumber}>
                0{index + 1} / 0{bodies.length}
              </span>

              <h3>{body.name}</h3>

              <p>{body.tagline}</p>

              <span className={styles.exploreLabel}>
                EXPLORE DESTINATION →
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className={styles.bodyFooter}>
        TWO WORLDS · ENDLESS POSSIBILITIES
      </p>
    </section>
  )
}
