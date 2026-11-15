# Worlds Map

Frontend for **Worlds Map**, a project built during the **NASA Space Apps Challenge**.

Worlds Map helps users discover Earth locations whose terrain and environmental conditions
are analogous to specific features of the Moon and Mars.

The current flow is **search-first**:

1. Choose **Moon** or **Mars**.
2. Search a feature **by name** (primary) or enter **coordinates** (secondary).
3. Review the feature profile (mission context, highlights, data layers).
4. Analyze the data and compare it with Earth.
5. Browse Earth analogues ordered by compatibility, filter them with the minimum
   similarity threshold, and select one to locate it on the Leaflet map.

> ⚠️ All data shown in the current version is **DEMO / mock data** and does not represent
> real scientific results. Percentages are simulated for front-end development.

## Tech stack

- React 19 (JavaScript)
- Vite
- React Leaflet + Leaflet (OpenStreetMap tiles)
- Plain CSS (global tokens + CSS Modules per component)

## Getting started

Requirements: Node.js 20.19+ or 22.12+, and npm.

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

## Scripts

| Script                        | Description                                        |
| ----------------------------- | -------------------------------------------------- |
| `npm run dev`                 | Start the development server                       |
| `npm run build`               | Create a production build in `dist/`               |
| `npm run preview`             | Preview the production build locally               |
| `npm run validate:data`       | Validate the DEMO dataset, search, scoring and threshold |
| `npm run assets:placeholders` | Regenerate the provisional SVG image placeholders  |

## Project structure

```
public/
├── favicon.svg
└── images/
    ├── bodies/              Moon / Mars card images
    └── locations/           Earth location placeholders

scripts/
├── generate-placeholder-images.mjs
└── validate-demo-data.mjs

docs/
└── api-contract.md          Data contract agreed with the backend

src/
├── components/
│   ├── PlanetarySearch.jsx  Body tabs + name search / coordinate modes
│   ├── CoordinateSearch.jsx Per-body latitude/longitude validation
│   ├── FeatureProfile.jsx   Feature "curriculum" and analyze action
│   ├── SimilarityResults.jsx Threshold control + ordered result list
│   ├── SimilarityCard.jsx    One Earth analogue (image, country, score, rationale)
│   ├── EarthMap.jsx          Leaflet map synced with the result list
│   ├── Explorer.jsx          Search → analyze → compare state machine
│   └── ChallengeFooter.jsx   Challenge, proposal and DEMO disclaimer
├── data/
│   ├── celestialBodies.js
│   ├── coordinateSystems.js  Moon/Mars coordinate conventions
│   ├── earthLocations.js     16 Earth locations with curated demo matches
│   ├── planetaryFeatures.js Searchable Moon/Mars features
│   ├── regions.js           Base geographic records
│   ├── config.js            Threshold, demo latency and disclaimer
│   └── index.js             Public selectors
├── services/
│   ├── planetarySearchService.js  UI entry point (search / coordinates)
│   └── mockSimilarityService.js   DEMO similarity engine
├── styles/                  Global styles and design tokens
├── utils/                   Geo, search and similarity helpers
├── App.jsx                  Welcome → destination → Explorer shell
└── main.jsx                 Application entry point
```

## Architecture

The UI never imports the demo datasets directly. It talks to
`src/services/planetarySearchService.js`:

```js
searchPlanetaryFeatures(bodyId, query)            // → { query, features }
analyzePlanetaryCoordinates(bodyId, lat, lng)     // → feature (custom target)
analyzeFeatureAnalogues(feature, minimumSimilarity) // → ordered analogues
```

The similarity threshold is applied **outside** the scoring engine with
`filterByMinimumSimilarity(results, threshold)`, so moving the slider never re-runs
the analysis. The default is 70 % and lives in `src/data/config.js`.

The shapes and behaviour expected from the future backend are documented in
[`docs/api-contract.md`](docs/api-contract.md). Replacing the mock implementations with
`fetch` calls should not require UI changes.

### Coordinate conventions

Both bodies use planetocentric coordinates in this demo:

- latitude: −90° to 90° (positive north)
- longitude: −180° to 180° (positive east)

The coordinate form also accepts **0°–360° east** longitude and normalises it. Moon and
Mars conventions are defined separately in `src/data/coordinateSystems.js` so they can
diverge when real datasets are connected.

### Features that are not hard-coded

Users can enter any coordinates for a body. The demo infers a profile from the nearest
known feature, applies a confidence penalty based on the distance and labels the target
as **user-defined** throughout the UI.

## DEMO data

- `planetaryFeatures.js` — 12 searchable features (6 Moon, 6 Mars) with aliases,
  mission context, highlights and data layers.
- `earthLocations.js` — 16 Earth locations with coordinates, images, references and
  per-feature demo similarity scores + rationale.
- `regions.js` — base geographic records used to build the features.
- `coordinateSystems.js` — validation and normalisation per body.
- `config.js` — `DEFAULT_MINIMUM_SIMILARITY`, `DEMO_LATENCY_MS` and `DATA_DISCLAIMER`.

The dataset and its behaviour are validated automatically:

```bash
npm run validate:data
```

## Assets

`public/images` currently contains generated SVG placeholders labelled `DEMO IMAGE`.
Replace them with real assets when available (keep the same file names or update the
`image` field in the relevant data file). The Leaflet map uses OpenStreetMap tiles.

## Branch workflow

- `worlds-map-development` — integration branch where completed work is collected.
- `roger` — Roger’s working branch (current frontend work).
- `main` — legacy branch, not used for new work.
- Feature branches — `feat/<short-name>`, merged through pull requests.

Do not push directly to `worlds-map-development` while another teammate is working on it;
open a PR or coordinate first.

Commit messages follow a light Conventional Commits style: `feat:`, `fix:`, `chore:`, `docs:`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for ownership, conventions and the PR checklist.
