# Repository instructions

## Layout

- The active project is `nasa-analog-finder/`; the former root-level app was intentionally replaced.
- `data/` contains the three CSV source datasets, `backend/` generates static JSON, and `frontend/` is the Leaflet/vanilla-JS app.
- The frontend is static: there is no root `package.json`, bundler, or npm test suite.

## Data pipeline

- From `nasa-analog-finder/`, install Python dependencies with `python -m pip install -r backend/requirements.txt`.
- Regenerate both frontend datasets with `python backend/procesar_datos.py`; this is the default deterministic/offline path and must be run after changing CSVs or backend logic.
- Use `python backend/procesar_datos.py --live-api` only when Planetary Computer access is desired; failed or unavailable observations fall back to the CSV `Fallback_*` values.
- Treat `frontend/data/objetivos_espaciales.json` and `frontend/data/tierra_procesada.json` as generated outputs rather than hand-edited sources.
- `frontend/app.js` also contains embedded fallback copies for `file://` use; keep those copies synchronized with regenerated JSON when source data changes.

## Frontend verification

- Serve the app from `nasa-analog-finder/frontend/` so relative `data/...` fetches work: `python -m http.server 8000` and open `http://localhost:8000`.
- Opening `frontend/index.html` directly is supported through the embedded data fallback, but Leaflet still requires the CDN to be reachable.
- Check JavaScript syntax with `node --check frontend/app.js`.
- The project uses Prettier without a checked-in npm config; preserve the current readable formatting with `npx prettier --write --print-width 100 frontend/index.html frontend/styles.css frontend/app.js` and verify with the corresponding `--check` command.
- Leaflet is initialized only after the hidden welcome view becomes visible; preserve the `invalidateSize`/`ResizeObserver` behavior or the map can render blank until the window is resized.

## Change boundaries

- Do not replace generated JSON manually or remove the embedded fallback when changing the data pipeline.
- Keep frontend user-facing text in English; site proper names and scientific source references may remain official names.
- Similarity behavior lives in `frontend/app.js`; changes to parameter scales, weights, or the Gaussian scoring formula affect the ranking and should be validated for both Moon and Mars targets.
