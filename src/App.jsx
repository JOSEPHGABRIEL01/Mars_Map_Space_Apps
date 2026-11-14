/**
 * PROVISIONAL APPLICATION SHELL
 *
 * This file contains the navigation logic only. The visual design is NOT final
 * and will be replaced once the Figma design is ready.
 *
 * Flow implemented here:
 *   Welcome → Celestial body → Region → Earth map (list preview) → About
 *
 * Every block marked with TODO will be replaced by a dedicated component:
 *   TODO(Etapa 4): CelestialBodySelector, RegionSelector
 *   TODO(Etapa 5): EarthMap, MapMarker, LocationDetails, SimilarityResults
 *   TODO(Etapa 6): CoordinateSearch
 *   TODO(Etapa 7): AboutSection, final visual polish
 */

import { useState } from 'react'

import styles from './App.module.css'
import {
  CELESTIAL_BODIES,
  DATA_DISCLAIMER,
  getBodyById,
  getDemoStats,
  getMatchesForRegion,
  getRegionById,
  getRegionsByBody,
} from './data'
import { formatCoordinates } from './utils/geo'
import { formatSimilarity, getSimilarityLabel } from './utils/similarity'

const STAGE = {
  WELCOME: 'welcome',
  BODY: 'body',
  REGION: 'region',
  MAP: 'map',
  ABOUT: 'about',
}

const PREVIOUS_STAGE = {
  [STAGE.BODY]: STAGE.WELCOME,
  [STAGE.REGION]: STAGE.BODY,
  [STAGE.MAP]: STAGE.REGION,
}

const DEMO_STATS = getDemoStats()

export default function App() {
  const [stage, setStage] = useState(STAGE.WELCOME)
  const [stageBeforeAbout, setStageBeforeAbout] = useState(STAGE.WELCOME)
  const [bodyId, setBodyId] = useState(null)
  const [regionId, setRegionId] = useState(null)
  const [locationId, setLocationId] = useState(null)

  const body = bodyId ? getBodyById(bodyId) : null
  const regions = bodyId ? getRegionsByBody(bodyId) : []
  const region = regionId ? getRegionById(regionId) : null
  const matches = regionId ? getMatchesForRegion(regionId) : []

  // A location is considered selected if the user picked one or, by default,
  // the best-scoring match. This mirrors the behaviour of the future map.
  const selectedLocation =
    matches.find((location) => location.id === locationId) ?? matches[0] ?? null

  function startOver() {
    setBodyId(null)
    setRegionId(null)
    setLocationId(null)
    setStage(STAGE.WELCOME)
  }

  function selectBody(nextBodyId) {
    setBodyId(nextBodyId)
    setRegionId(null)
    setLocationId(null)
    setStage(STAGE.REGION)
  }

  function selectRegion(nextRegionId) {
    setRegionId(nextRegionId)
    setLocationId(null)
    setStage(STAGE.MAP)
  }

  function openAbout() {
    if (stage !== STAGE.ABOUT) setStageBeforeAbout(stage)
    setStage(STAGE.ABOUT)
  }

  function closeAbout() {
    setStage(stageBeforeAbout)
  }

  function goBack() {
    const previous = PREVIOUS_STAGE[stage]
    if (previous) setStage(previous)
  }

  return (
    <div className={styles.app}>
      <p className={styles.banner} role="note">
        Provisional interface — functionality under construction. Final visual design is
        pending (Figma).
      </p>

      <header className={styles.header}>
        <button type="button" className={styles.brand} onClick={startOver}>
          Worlds Map
        </button>

        <nav className={styles.nav} aria-label="Main navigation">
          <button type="button" className={styles.navButton} onClick={startOver}>
            Home
          </button>
          <button type="button" className={styles.navButton} onClick={openAbout}>
            About
          </button>
        </nav>
      </header>

      <main className={styles.main}>
        {stage === STAGE.WELCOME && (
          <WelcomeStep stats={DEMO_STATS} onStart={() => setStage(STAGE.BODY)} />
        )}

        {stage === STAGE.BODY && (
          <BodyStep bodies={CELESTIAL_BODIES} onSelect={selectBody} onBack={goBack} />
        )}

        {stage === STAGE.REGION && body && (
          <RegionStep
            body={body}
            regions={regions}
            onSelect={selectRegion}
            onBack={goBack}
          />
        )}

        {stage === STAGE.MAP && region && (
          <MapStep
            body={body}
            region={region}
            matches={matches}
            selectedLocation={selectedLocation}
            onSelectLocation={setLocationId}
            onBack={goBack}
          />
        )}

        {stage === STAGE.ABOUT && <AboutStep onClose={closeAbout} />}
      </main>

      <footer className={styles.footer}>
        <p>{DATA_DISCLAIMER}</p>
      </footer>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Provisional step screens (to be replaced by dedicated components)          */
/* -------------------------------------------------------------------------- */

function WelcomeStep({ stats, onStart }) {
  return (
    <section className={styles.section}>
      <p className={styles.kicker}>NASA Space Apps Challenge · DEMO</p>
      <h1 className={styles.title}>Welcome to Worlds Map</h1>
      <p className={styles.lead}>
        Find places on Earth that resemble regions of the Moon or Mars. Choose a celestial
        body, select a region and explore its closest terrestrial analogs.
      </p>

      <ul className={styles.stats}>
        <li>
          <strong>{stats.celestialBodies}</strong> celestial bodies
        </li>
        <li>
          <strong>{stats.regions}</strong> regions
        </li>
        <li>
          <strong>{stats.earthLocations}</strong> Earth analogs
        </li>
      </ul>

      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={onStart}>
          Start exploring
        </button>
      </div>

      {/* TODO(Etapa 3): replace this block with <WelcomeScreen /> */}
      <p className={styles.note}>
        Provisional screen. The final welcome layout, imagery and typography will follow the
        Figma design.
      </p>
    </section>
  )
}

function BodyStep({ bodies, onSelect, onBack }) {
  return (
    <section className={styles.section}>
      <BackButton onBack={onBack} />

      <h2 className={styles.heading}>Select a celestial body</h2>
      <p className={styles.lead}>
        Moon and Mars regions are compared with terrestrial environments.
      </p>

      {/* TODO(Etapa 4): replace with <CelestialBodySelector /> */}
      <div className={styles.grid}>
        {bodies.map((body) => (
          <button
            key={body.id}
            type="button"
            className={styles.card}
            onClick={() => onSelect(body.id)}
          >
            <img className={styles.cardImage} src={body.image} alt="" />
            <span className={styles.cardTitle}>{body.name}</span>
            <span className={styles.muted}>{body.tagline}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function RegionStep({ body, regions, onSelect, onBack }) {
  return (
    <section className={styles.section}>
      <BackButton onBack={onBack} />

      <p className={styles.kicker}>{body.name}</p>
      <h2 className={styles.heading}>Select a region</h2>
      <p className={styles.lead}>
        Each region groups Earth locations with comparable terrain and conditions.
      </p>

      {/* TODO(Etapa 4): replace with <RegionSelector /> */}
      <ul className={styles.gridList}>
        {regions.map((region) => (
          <li key={region.id}>
            <button type="button" className={styles.listButton} onClick={() => onSelect(region.id)}>
              <span className={styles.cardTitle}>{region.name}</span>
              <span className={styles.muted}>{region.type}</span>
              <span className={styles.tags}>
                {region.highlights.map((highlight) => (
                  <span className={styles.tag} key={highlight}>
                    {highlight}
                  </span>
                ))}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MapStep({ body, region, matches, selectedLocation, onSelectLocation, onBack }) {
  return (
    <section className={styles.section}>
      <BackButton onBack={onBack} />

      <p className={styles.kicker}>
        {body.name} · {region.locationLabel}
      </p>
      <h2 className={styles.heading}>{region.name}</h2>
      <p className={styles.lead}>{region.summary}</p>

      <p className={styles.note}>
        Provisional results view. The Earth map, PNG background and markers will be added in a
        later step; this list already uses the same sorted match data.
      </p>

      {matches.length === 0 ? (
        <p className={styles.emptyState} role="status">
          No Earth analogs are available for this region yet.
        </p>
      ) : (
        <div className={styles.twoColumns}>
          {/* TODO(Etapa 5): replace with <SimilarityResults /> */}
          <div>
            <h3 className={styles.subheading}>Earth analogs</h3>
            <ul className={styles.gridList}>
              {matches.map((location) => {
                const isSelected = selectedLocation?.id === location.id
                return (
                  <li key={location.id}>
                    <button
                      type="button"
                      className={`${styles.listButton} ${isSelected ? styles.listButtonActive : ''}`}
                      aria-pressed={isSelected}
                      onClick={() => onSelectLocation(location.id)}
                    >
                      <span className={styles.scoreRow}>
                        <span className={styles.cardTitle}>{location.name}</span>
                        <span className={styles.score}>{formatSimilarity(location.similarity)}</span>
                      </span>
                      <span className={styles.muted}>{location.country}</span>
                      <span className={styles.muted}>
                        {formatCoordinates(location.lat, location.lng)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* TODO(Etapa 5): replace with <LocationDetails /> */}
          <LocationPreview location={selectedLocation} />
        </div>
      )}

      <p className={styles.note}>
        {/* TODO(Etapa 6): replace with <CoordinateSearch /> */}
        Manual coordinate analysis will be added in a later step.
      </p>
    </section>
  )
}

function LocationPreview({ location }) {
  if (!location) return null

  return (
    <aside className={styles.details} aria-label="Selected location details">
      <img className={styles.detailsImage} src={location.image} alt={`Demo image of ${location.name}`} />

      <h3 className={styles.subheading}>{location.name}</h3>
      <p className={styles.muted}>
        {location.region}, {location.country}
      </p>

      <dl className={styles.factList}>
        <div>
          <dt>Coordinates</dt>
          <dd>{formatCoordinates(location.lat, location.lng)}</dd>
        </div>
        <div>
          <dt>Analog similarity</dt>
          <dd>
            {formatSimilarity(location.similarity)} · {getSimilarityLabel(location.similarity)}
          </dd>
        </div>
      </dl>

      <p>{location.summary}</p>

      <h4 className={styles.miniHeading}>Why it matches</h4>
      <p>{location.rationale}</p>

      <h4 className={styles.miniHeading}>Environment</h4>
      <p className={styles.tags}>
        {location.environment.map((item) => (
          <span className={styles.tag} key={item}>
            {item}
          </span>
        ))}
      </p>

      <h4 className={styles.miniHeading}>References</h4>
      <ul className={styles.references}>
        {location.references.map((reference) => (
          <li key={reference.url}>
            <a href={reference.url} target="_blank" rel="noreferrer">
              {reference.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  )
}

function AboutStep({ onClose }) {
  return (
    <section className={styles.section}>
      <button type="button" className={styles.backButton} onClick={onClose}>
        ← Back
      </button>

      <p className={styles.kicker}>The challenge</p>
      <h2 className={styles.heading}>About Worlds Map</h2>

      {/* TODO(Etapa 7): replace with <AboutSection /> */}
      <p className={styles.lead}>
        This project explores terrestrial analogs for permanent Moon base locations and Mars.
        By comparing terrain, climate and geology, Worlds Map helps identify places on Earth
        where future missions can be prepared and tested.
      </p>

      <h3 className={styles.subheading}>Our proposal</h3>
      <p>
        An interactive map that connects a selected Moon or Mars region with Earth locations
        that share similar characteristics. Each location includes coordinates, a demo
        similarity score, environment tags and references.
      </p>

      <h3 className={styles.subheading}>Project status</h3>
      <p>
        Frontend prototype only. Data, scores and images are DEMO placeholders; the visual
        design is being produced in Figma and the backend will be connected later.
      </p>

      <p className={styles.note}>About content is provisional and will be rewritten in Step 7.</p>
    </section>
  )
}

function BackButton({ onBack }) {
  return (
    <button type="button" className={styles.backButton} onClick={onBack}>
      ← Back
    </button>
  )
}
