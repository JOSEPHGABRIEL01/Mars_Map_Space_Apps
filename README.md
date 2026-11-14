# Worlds Map

Frontend for **Worlds Map**, a project built during the **NASA Space Apps Challenge**.

Worlds Map helps users discover Earth locations whose terrain and environmental conditions
are analogous to specific regions of the Moon and Mars.

> ⚠️ All data shown in the current version is **DEMO / mock data** and does not represent
> real scientific results.

## Tech stack

- React (JavaScript)
- Vite
- Plain CSS (global tokens + CSS Modules per component)

## Getting started

Requirements: Node.js 20.19+ or 22.12+, and npm.

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

## Scripts

| Script                        | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `npm run dev`                 | Start the development server                    |
| `npm run build`               | Create a production build in `dist/`            |
| `npm run preview`             | Preview the production build locally            |
| `npm run validate:data`       | Validate the DEMO dataset for consistency       |
| `npm run assets:placeholders` | Regenerate the provisional SVG image placeholders |

## Project structure

```
public/
├── favicon.svg
└── images/
    ├── earth-map.svg        Placeholder for the final map asset (equirectangular)
    ├── bodies/              Moon / Mars card images
    └── locations/           Earth location photos (placeholders for now)
scripts/
├── generate-placeholder-images.mjs
└── validate-demo-data.mjs
src/
├── assets/       Images and static assets imported by components
├── components/   Reusable UI components (+ CSS Modules)
├── data/         DEMO data layer and selectors
├── hooks/        Custom React hooks
├── services/     Mock API (replaced by the real backend later)
├── styles/       Global styles and design tokens
├── utils/        Geo, similarity and formatting helpers
├── App.jsx       Application shell and stage navigation
└── main.jsx      Application entry point
```

## Demo data layer

Everything the UI needs lives behind `src/data`:

- `celestialBodies.js` — Moon and Mars metadata.
- `regions.js` — 6 Moon regions and 6 Mars regions.
- `earthLocations.js` — 16 Earth analogs with coordinates, images, references and
  per-region similarity scores.
- `index.js` — public selectors (`getRegionsByBody`, `getMatchesForRegion`, …).
- `config.js` — map asset path, aspect ratio, disclaimer and demo latency.

Components should import selectors from `src/data` and data through
`src/services/mockApi.js`, which simulates the future backend (latency + errors).
Swapping the mock API for real `fetch` calls should not require UI changes.

Utilities:

- `src/utils/geo.js` — equirectangular projection (`projectToMap`), coordinate
  formatting and parsing, great-circle distance.
- `src/utils/similarity.js` — sorting, clamping, formatting and similarity tiers.

The dataset is validated automatically:

```bash
npm run validate:data
```

## Assets

`public/images` currently contains generated SVG placeholders, clearly labelled
`DEMO IMAGE`. Replace them with the real assets exported from Figma:

- `earth-map.svg` → final Earth map (keep the equirectangular projection; if the
  aspect ratio changes, update `EARTH_MAP_ASPECT_RATIO` in `src/data/config.js`).
- `bodies/*` → Moon and Mars artwork.
- `locations/*` → photos of each Earth location (keep the same file names or
  update the `image` field in `earthLocations.js`).

## Branch workflow

- `main` — stable branch, always deployable.
- `roger` — personal working branch.
- Feature branches — `feat/<short-name>`, merged through pull requests.

Commit messages follow a light Conventional Commits style: `feat:`, `fix:`, `chore:`, `docs:`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for ownership, conventions and the PR checklist.
