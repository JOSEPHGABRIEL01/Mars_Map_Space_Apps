# Worlds Map — frontend ↔ backend data contract

This document describes what the frontend needs to render the search-and-compare
experience. Nothing here is final; the backend team should confirm or adjust the field
names. While the backend is being built, `src/services/planetarySearchService.js` and
`src/services/mockSimilarityService.js` implement this contract with DEMO data.

## Conventions

- All values are JSON-friendly; dates are ISO strings when added.
- Scores are integers from `0` to `100`.
- Coordinates are decimal degrees as numbers.
- Body identifiers: `"moon"` and `"mars"`.
- Every response that contains simulated data must be labelled `demo: true`. The frontend
  shows the `DATA_DISCLAIMER` permanently.

## Bodies

```json
{
  "id": "mars",
  "name": "Mars",
  "tagline": "The Red Planet",
  "description": "…",
  "meanRadiusKm": 3389.5,
  "image": "/images/bodies/mars.svg",
  "accentColor": "#e0714a"
}
```

`meanRadiusKm` is used to convert angular distances into kilometres for coordinates that
are not close to a known feature.

## Planetary feature

```json
{
  "id": "mars-jezero",
  "bodyId": "mars",
  "name": "Jezero Crater",
  "locationLabel": "Northeast Syrtis Major",
  "type": "Impact crater with a paleolake delta",
  "summary": "Short paragraph shown in the profile.",
  "profile": "Longer explanation of the feature's exploration value.",
  "missionContext": "NASA Perseverance rover landing site (Mars 2020).",
  "highlights": ["Paleolake delta", "Clay minerals"],
  "dataLayers": ["Elevation", "Mineralogy", "Paleolake sediments"],
  "aliases": ["Jezero", "Perseverance landing site"],
  "coordinates": { "lat": 18.38, "lng": 77.58 },
  "isCustom": false
}
```

### Custom feature from coordinates

The frontend can create a target from user-entered coordinates. The backend may do the
same, but must keep these extra fields so the UI can explain the inference:

```json
{
  "id": "custom-mars-18.400-133.800",
  "bodyId": "mars",
  "name": "Custom target · 18.40° N, 133.80° W",
  "isCustom": true,
  "baseFeatureId": "mars-jezero",
  "baseFeatureName": "Jezero Crater",
  "distanceKm": 3120,
  "scorePenalty": 18,
  "rationalePrefix": "Inferred from the nearest demo feature (Jezero Crater, ≈3,120 km away).",
  "coordinates": { "lat": 18.4, "lng": -133.8 }
}
```

`scorePenalty` (0–25) is subtracted from every analogue score. The UI always labels custom
targets as user-defined and DEMO.

## Earth analogue

```json
{
  "id": "atacama-desert",
  "name": "Atacama Desert",
  "country": "Chile",
  "region": "Antofagasta Region",
  "lat": -23.5,
  "lng": -68.4,
  "image": "/images/locations/atacama-desert.svg",
  "summary": "Why this location is interesting.",
  "environment": ["Hyper-arid", "High UV radiation", "Saline soils"],
  "references": [{ "label": "Wikipedia", "url": "https://…" }],
  "similarity": 82,
  "rationale": "Short explanation of the match.",
  "featureId": "mars-jezero",
  "featureName": "Jezero Crater"
}
```

`similarity` and `rationale` are always relative to the feature that was analyzed.

## Service functions

The UI currently calls these functions. Backend implementations should keep the names,
arguments and response shapes, or the frontend adapter must map to them.

### `searchPlanetaryFeatures(bodyId, query, { signal })`

- Returns `{ query, features: Feature[] }`.
- `features` is ordered best match first (exact name/alias, then prefix, then partial).
- An unknown query returns an empty array, not an error.
- Unknown body or server failure throws an `Error` (the UI shows the message).

### `analyzePlanetaryCoordinates(bodyId, latitude, longitude, { signal })`

- Validates the coordinate against the body's system.
- Returns a **Feature** (possibly custom) ready for `analyzeFeatureAnalogues`.
- Out-of-range or non-numeric values throw an `Error` with a user-safe message.

### `analyzeFeatureAnalogues(feature, minimumSimilarity, { signal })`

- Returns `EarthAnalogue[]` ordered by descending similarity.
- `minimumSimilarity` is optional (default `0`). The frontend normally passes `0` and
  filters on the client so the slider is instant.
- When the threshold is enabled server-side, apply it **after** sorting.

### `getEarthAnalogues(feature, minimumSimilarity, { signal })`

Alias used internally by the mock similarity engine. Backend can expose
`analyzeFeatureAnalogues` directly.

## Coordinate systems

The frontend validates against `src/data/coordinateSystems.js`:

| Body | Latitude | Longitude | Notes |
| ---- | -------- | --------- | ----- |
| Moon | −90…90 | −180…180 | East-positive planetocentric. 0…360 east accepted and normalised. |
| Mars | −90…90 | −180…180 | East-positive planetocentric. Some products use 0…360 east; accepted and normalised. |

The backend should return coordinates in the same `{ lat, lng }` convention and document
any change (for example planetographic latitude or west-positive longitude) in this file.

## Threshold behaviour

- Default: **70 %**, stored in `src/data/config.js`.
- The UI computes all analogues once, then calls
  `filterByMinimumSimilarity(results, threshold)` from `src/utils/similarity.js`.
- Results at or above the threshold are shown, highest first.
- Changing the threshold must not require a new network request.
- Auto-selection: when the current selection falls below the threshold, the map selects
  the highest visible analogue.

Example: scores `94, 87, 79, 68, 55` with a threshold of `70` show `94, 87, 79`.

## What the frontend needs from the backend

1. Body list with stable IDs and radii.
2. Feature search/resolution by name (including aliases) and by coordinates.
3. For each feature: identity, location, type, summary/profile, mission context,
   highlights and available data layers.
4. Earth locations with coordinates, country/region, image and references.
5. Similarity score and short rationale per feature/location pair.
6. A way to distinguish real data from demo data (`demo: true`).
7. Coordinate convention per body, including accepted input ranges.

Until those exist, the mock services in `src/services` are the source of truth and the
validation script (`npm run validate:data`) checks the dataset and the search/scoring
behaviour.
