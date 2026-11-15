# Contributing to Worlds Map

This document explains how the team works on the frontend so we can develop in
parallel without stepping on each other.

## 1. Requirements and setup

- Node.js 20.19+ or 22.12+
- npm 10+
- Git

```bash
git clone https://github.com/JOSEPHGABRIEL01/Mars_Map_Space_Apps.git
cd Mars_Map_Space_Apps
npm install
npm run dev
```

The app runs at http://localhost:5173.

Useful scripts:

| Script                      | Purpose                                        |
| --------------------------- | ---------------------------------------------- |
| `npm run dev`               | Development server with hot reload             |
| `npm run build`             | Production build (must pass before a PR)       |
| `npm run preview`           | Preview the production build                   |
| `npm run validate:data`     | Verify the DEMO dataset is internally coherent |
| `npm run assets:placeholders` | Regenerate the provisional SVG placeholders  |

## 2. Branch strategy

| Branch                    | Purpose                                      |
| ------------------------- | -------------------------------------------- |
| `worlds-map-development`  | Integration branch (acts as the main line)   |
| `roger`                   | Roger’s personal working branch              |
| `main`                    | Legacy branch, not used for new work         |
| `feat/<name>`             | New component or feature                     |
| `fix/<name>`              | Bug fix                                      |
| `docs/<name>`             | Documentation only                           |
| `chore/<name>`            | Tooling, dependencies, configuration         |

Rules:

1. Never commit directly to `main`.
2. Coordinate before pushing to `worlds-map-development`; open a PR or merge request.
3. Keep your branch focused on one feature or component.
4. Rebase or merge `worlds-map-development` into your branch before opening a PR.
5. Pull requests are merged only after review (squash merge preferred).

```bash
# start working
git switch worlds-map-development
git pull
git switch -c feat/earth-map

# publish your work
git add -A
git commit -m "feat: add EarthMap component"
git push -u origin feat/earth-map
```

## 3. Commit messages

Light Conventional Commits:

```
feat: add MapMarker component
fix: correct marker position for negative longitudes
docs: document demo data model
chore: add prettier configuration
refactor: extract similarity helpers
```

Use the imperative mood and keep the subject under ~72 characters.

## 4. Work ownership (avoid conflicts)

Only one person should edit a shared file at a time. Everything else is owned by
the component’s author.

| Area / file                          | Owner        | Notes                                  |
| ------------------------------------ | ------------ | -------------------------------------- |
| `src/App.jsx`                        | Roger        | Application shell and navigation       |
| `src/main.jsx`                       | Roger        | Entry point and Leaflet CSS import     |
| `src/styles/variables.css`           | Roger        | Design tokens                          |
| `src/styles/global.css`              | Roger        | Global reset/base                      |
| `package.json` / lockfile            | Roger        | Dependency changes via PR only         |
| `src/data/**`                        | Roger        | Demo dataset, coordinates, selectors   |
| `src/services/**`                    | Roger        | Mock backend and similarity engine     |
| `src/utils/**`                       | Roger        | Geo, search and similarity helpers     |
| `src/components/Explorer.*`          | Roger        | Search → analyze → compare flow        |
| `src/components/PlanetarySearch.*`   | Roger        | Body tabs, name search, mode switch    |
| `src/components/CoordinateSearch.*`  | Roger        | Manual coordinate validation           |
| `src/components/FeatureProfile.*`    | Roger        | Feature profile / curriculum           |
| `src/components/SimilarityResults.*` | Roger        | Threshold control and ordered list     |
| `src/components/SimilarityCard.*`    | Roger        | Single Earth analogue card             |
| `src/components/EarthMap.*`          | Katia / Roger | Leaflet map (Katia’s base, sync added) |
| `src/components/ChallengeFooter.*`   | Roger        | Challenge, proposal and disclaimer     |
| `src/components/Navbar.*`            | _unassigned_ |                                        |
| `src/components/WelcomeScreen.*`     | _unassigned_ |                                        |
| `src/components/CelestialBodySelector.*` | _unassigned_ |                                    |

Update the “Owner” column when the team splits the work. If two people need to
touch the same file, coordinate first and merge in small steps.

### Shared files

- `App.jsx`, `variables.css` and `global.css` change only through a PR.
- Do not reformat files you did not edit; it creates noisy diffs and conflicts.
- New dependencies: open a PR with a one-line justification.

## 5. Code conventions

- **JavaScript + React function components**, no class components.
- One component per file: `PascalCase.jsx` (`EarthMap.jsx`).
- Styles: `ComponentName.module.css`, imported as `styles`:

  ```jsx
  import styles from './EarthMap.module.css'

  export default function EarthMap() {
    return <section className={styles.map}>...</section>
  }
  ```

- Use design tokens from `variables.css` (`var(--color-cyan)`, `var(--space-4)`).
  Never hard-code hex colours or pixel spacing in components.
- Props must be explicit and documented with a short comment when non-obvious.
- Keep components presentational: data comes from props; fetching lives in the
  parent or in `src/hooks`.
- All user-facing text is in **English**.
- Accessibility: semantic HTML, `button` for actions, `alt` on images, visible
  focus states, labels associated with inputs.

## 6. DEMO data rules

- `src/data/**` is **demo data**. Every screen that shows it must communicate
  that it is not a scientific result (see `DATA_DISCLAIMER`).
- Never present invented similarity scores as real science.
- Numeric scores live in the `matches` array of each Earth location, 0–100.
- Base planetary records live in `regions.js`; search metadata lives in
  `planetaryFeatures.js`.
- Coordinates use decimal degrees, latitude first:
  - Moon and Mars: planetocentric latitude −90…90, east-positive longitude −180…180.
  - 0…360 east longitude is accepted by the coordinate form and normalised.
  - Systems are documented per body in `src/data/coordinateSystems.js`.
- Run `npm run validate:data` after any change to the dataset.
- Components must consume `src/services/planetarySearchService.js`, not the data files
  directly. The threshold is applied with `filterByMinimumSimilarity`.
- The Leaflet map uses GeoJSON-style `{ lat, lng }` coordinates; never store pixel
  positions.

## 7. Adding a demo location or feature

### Earth location

1. Add an object to `src/data/earthLocations.js` following the existing model.
2. Point `image` to `/images/locations/<slug>.svg`.
3. Generate the placeholder: `npm run assets:placeholders`.
4. Add at least one entry to `matches` using a valid feature ID.
5. Run `npm run validate:data` and `npm run build`.
6. Commit with `feat: add <location> demo location`.

### Moon / Mars feature

1. Add the base record to `src/data/regions.js` (or `planetaryFeatures.js` if it will
   not be reused elsewhere).
2. Add aliases, `missionContext` and `dataLayers` in `planetaryFeatures.js`.
3. Add at least one Earth `match` pointing to the new feature ID.
4. Check the name search: `searchFeatures` must resolve the name and aliases.
5. Run `npm run validate:data` and `npm run build`.

## 8. Definition of done (PR checklist)

- [ ] `npm run dev` runs without console errors.
- [ ] `npm run build` succeeds.
- [ ] `npm run validate:data` passes (if data changed).
- [ ] Component works at 1280 px and 375 px widths.
- [ ] Loading, empty and error states are handled where relevant.
- [ ] UI copy is in English and demo data is labelled as DEMO.
- [ ] No hard-coded colours/spacing; tokens are used.
- [ ] Screenshots or a short recording are attached for UI changes.

## 9. Communication

- Use GitHub Issues for tasks and bugs; link the issue in the PR description.
- Announce in the team chat when you start touching a shared file.
- Ask for review rather than merging your own PR into `main`.
