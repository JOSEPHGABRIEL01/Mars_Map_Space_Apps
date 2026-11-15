import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DEFAULT_MINIMUM_SIMILARITY } from '../data'
import {
  analyzeFeatureAnalogues,
  analyzePlanetaryCoordinates,
  searchPlanetaryFeatures,
} from '../services/planetarySearchService'
import { filterByMinimumSimilarity, sortBySimilarity } from '../utils/similarity'
import EarthMap from './EarthMap'
import FeatureProfile from './FeatureProfile'
import PlanetarySearch from './PlanetarySearch'
import SimilarityResults from './SimilarityResults'
import styles from './Explorer.module.css'

const STATUS = {
  IDLE: 'idle',
  SEARCHING: 'searching',
  ANALYZING: 'analyzing',
  SUCCESS: 'success',
  EMPTY: 'empty',
  ERROR: 'error',
}

export default function Explorer({ body, onBack }) {
  const [status, setStatus] = useState(STATUS.IDLE)
  const [feature, setFeature] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [results, setResults] = useState([])
  const [threshold, setThreshold] = useState(DEFAULT_MINIMUM_SIMILARITY)
  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const abortRef = useRef(null)

  const startRequest = useCallback(() => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    return controller
  }, [])

  const resetSession = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStatus(STATUS.IDLE)
    setFeature(null)
    setCandidates([])
    setResults([])
    setSelectedLocationId(null)
    setFeedback(null)
  }, [])

  // A new destination starts a clean session.
  useEffect(() => {
    resetSession()
    return () => abortRef.current?.abort()
  }, [body.id, resetSession])

  const analyzeTarget = useCallback(
    async (target, controller) => {
      setFeature(target)
      setCandidates([])
      setResults([])
      setSelectedLocationId(null)
      setFeedback(null)
      setStatus(STATUS.ANALYZING)

      try {
        const analogs = await analyzeFeatureAnalogues(target, 0, {
          signal: controller.signal,
        })
        setResults(analogs)
        setStatus(STATUS.SUCCESS)

        if (analogs.length === 0) {
          setFeedback({
            type: 'notice',
            text: `The demo dataset has no Earth analogues for ${target.name} yet.`,
          })
        }
      } catch (error) {
        if (error.name === 'AbortError' || controller.signal.aborted) return
        setStatus(STATUS.ERROR)
        setFeedback({
          type: 'error',
          text: error.message || 'The analysis could not be completed.',
        })
      }
    },
    [],
  )

  const handleSearchByName = useCallback(
    async (query) => {
      const controller = startRequest()
      setStatus(STATUS.SEARCHING)
      setFeature(null)
      setCandidates([])
      setResults([])
      setSelectedLocationId(null)
      setFeedback(null)

      try {
        const response = await searchPlanetaryFeatures(body.id, query, {
          signal: controller.signal,
        })

        if (response.features.length === 0) {
          setStatus(STATUS.EMPTY)
          setFeedback({
            type: 'notice',
            text: `No ${body.name} feature matches “${query}”. Try a shorter name, an alias such as “Olympus”, or enter coordinates instead.`,
          })
          return
        }

        if (response.features.length === 1) {
          await analyzeTarget(response.features[0], controller)
          return
        }

        setCandidates(response.features)
        setStatus(STATUS.IDLE)
      } catch (error) {
        if (error.name === 'AbortError' || controller.signal.aborted) return
        setStatus(STATUS.ERROR)
        setFeedback({
          type: 'error',
          text: error.message || 'The search could not be completed.',
        })
      }
    },
    [analyzeTarget, body.id, body.name, startRequest],
  )

  const handleAnalyzeCoordinates = useCallback(
    async ({ lat, lng, rawLng }) => {
      const controller = startRequest()
      setStatus(STATUS.ANALYZING)
      setFeature(null)
      setCandidates([])
      setResults([])
      setSelectedLocationId(null)
      setFeedback(null)

      try {
        const customFeature = await analyzePlanetaryCoordinates(body.id, lat, rawLng ?? lng, {
          signal: controller.signal,
        })
        await analyzeTarget(customFeature, controller)
      } catch (error) {
        if (error.name === 'AbortError' || controller.signal.aborted) return
        setStatus(STATUS.ERROR)
        setFeedback({
          type: 'error',
          text: error.message || 'The coordinates could not be analyzed.',
        })
      }
    },
    [analyzeTarget, body.id, startRequest],
  )

  const handleSelectCandidate = useCallback(
    (candidate) => {
      const controller = startRequest()
      analyzeTarget(candidate, controller)
    },
    [analyzeTarget, startRequest],
  )

  const handleAnalyzeAgain = useCallback(() => {
    if (!feature) return
    const controller = startRequest()
    analyzeTarget(feature, controller)
  }, [analyzeTarget, feature, startRequest])

  const handleBodyChange = useCallback(() => {
    onBack()
  }, [onBack])

  const filteredResults = useMemo(
    () => sortBySimilarity(filterByMinimumSimilarity(results, threshold)),
    [results, threshold],
  )

  // Keep a valid map selection: keep the user's choice when it still passes the
  // threshold, otherwise select the best visible analogue.
  useEffect(() => {
    setSelectedLocationId((current) => {
      if (filteredResults.length === 0) return null
      if (current && filteredResults.some((result) => result.id === current)) return current
      return filteredResults[0].id
    })
  }, [filteredResults])

  return (
    <section className={styles.explorer}>
      <header className={styles.header}>
        <button type="button" className={styles.backButton} onClick={handleBodyChange}>
          ← Change destination
        </button>

        <div className={styles.headerText}>
          <p className={styles.kicker}>{body.name} · Explorer</p>
          <h1 className={styles.title}>
            Search, analyze and compare<span>.</span>
          </h1>
          <p className={styles.lead}>
            Find a feature on {body.name} by name or coordinates, review its exploration
            profile, then compare it with Earth locations. All scores are demo data.
          </p>
        </div>

        <div className={styles.bodyBadge} aria-hidden="true">
          <img src={body.image} alt="" />
          <span>{body.name}</span>
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.searchColumn}>
          <PlanetarySearch
            body={body}
            status={status}
            candidates={candidates}
            onSearchByName={handleSearchByName}
            onAnalyzeCoordinates={handleAnalyzeCoordinates}
            onSelectCandidate={handleSelectCandidate}
          />

          {feedback?.type === 'notice' && (
            <p className={styles.notice} role="status">
              {feedback.text}
            </p>
          )}

          {feature && (
            <FeatureProfile
              feature={feature}
              body={body}
              isAnalyzing={status === STATUS.ANALYZING}
              onAnalyze={handleAnalyzeAgain}
            />
          )}
        </div>

        <div className={styles.resultsColumn}>
          <SimilarityResults
            feature={feature}
            body={body}
            results={filteredResults}
            totalResults={results.length}
            threshold={threshold}
            selectedLocationId={selectedLocationId}
            isAnalyzing={status === STATUS.ANALYZING}
            errorMessage={feedback?.type === 'error' ? feedback.text : null}
            onThresholdChange={setThreshold}
            onSelectLocation={setSelectedLocationId}
          />

          <EarthMap
            locations={filteredResults}
            selectedLocationId={selectedLocationId}
            onSelectLocation={setSelectedLocationId}
            status={status}
          />
        </div>
      </div>
    </section>
  )
}
