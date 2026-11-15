# NASA Analog Finder

Leaflet frontend plus a Python backend that rank Earth locations by how closely
their environmental parameters resemble a Moon or Mars reference site.

The frontend is plain HTML, CSS and JavaScript built with Vite. Leaflet and the
JSON datasets are imported as modules and bundled at build time, so the browser
no longer needs a CDN or a runtime fetch for the data. The backend uses only the
Python standard library.

## Requirements

- Python 3.10+ (the server and tests use the standard library only).
- Node.js 20.19+ and npm (needed to build or develop the frontend).

Install the frontend dependencies once:

```bash
cd nasa-analog-finder
npm install
```

## Run it

### Development: Vite plus the Python API

```bash
npm run dev:full
```

This starts the Python API on <http://127.0.0.1:8000> and Vite on
<http://127.0.0.1:5173>. Vite proxies `/api` to the backend, so the page uses
the live ranking API. Open <http://127.0.0.1:5173>.

To run the two servers in separate terminals:

```bash
npm run backend   # terminal 1, Python API on :8000
npm run dev       # terminal 2, Vite on :5173
```

### Production: one server for the API and the built app

```bash
npm run build
npm run serve
```

Open <http://127.0.0.1:8000>. `npm run serve` runs
`python backend/server.py --static-dir frontend/dist`; the server serves the
compiled assets, injects `window.ANALOG_API_BASE = "/api"` into `index.html`,
and answers the JSON API. `npm start` runs the build and the server together.

### Build and preview only

```bash
npm run build     # writes frontend/dist
npm run preview   # serves frontend/dist on http://127.0.0.1:4173
```

`npm run preview` serves the production build. No API base is injected there, so
it runs in **offline mode** and scores candidates in the browser from the JSON
bundled by Vite. To use a running backend either use `npm run serve`, or open
`http://127.0.0.1:4173/?api=http://127.0.0.1:8000/api`.

Options:

```bash
python backend/server.py --host 0.0.0.0 --port 8080 --static-dir frontend/dist
python backend/server.py --source csv        # use the curated CSV tables
python backend/server.py --data-dir ../data --frontend-dir ./frontend
```

`--frontend-dir` is where the API reads `data/*.json`; `--static-dir` is the
built site served to the browser. When `--static-dir` is omitted it defaults to
`--frontend-dir`, which keeps serving the source files for tests and tooling.
The source `frontend/` folder is not meant to be opened directly in a browser
because its ES module imports need Vite; run `npm run build` or `npm run dev`
first.

A `?api=` query parameter can still point the page at another running backend:

```
http://127.0.0.1:5173/?api=http://127.0.0.1:8000/api
```

## Backend API

| Method | Route             | Purpose                                            |
| ------ | ----------------- | -------------------------------------------------- |
| GET    | `/api/health`     | Status, data source and dataset counts             |
| GET    | `/api/parameters` | Parameter labels, units, scales, weights and bounds |
| GET    | `/api/targets`    | Reference targets, filter with `?body=Moon`        |
| GET    | `/api/candidates` | Earth candidate sites                              |
| POST   | `/api/analogs`    | Rank candidates against a preset or custom target  |

`POST /api/analogs` accepts:

```json
{ "body": "Moon", "targetId": "South Pole" }
```

```json
{ "body": "Mars", "target": { "Pendiente°": 5, "Indice_vegetacion(NDVI)": 0.08 } }
```

The custom `target` may omit any field. Empty fields are `null`, never zero,
and are excluded from the comparison. Invalid values return HTTP `422` with a
per-field `errors` object.

## What it does

- **Moon / Mars reference sites** — choose a body and a preset mission target.
- **Custom targets** — enter maximum/minimum temperature, thermal range, slope,
  NDVI, dust/aerosol and sulfate values. Any field can be left empty:
  - empty fields are stored as `null`, never as zero;
  - a parameter is compared only when both the target and the candidate have a
    value, so missing data never inflates or deflates the score;
  - thermal range is derived from max/min only when it is left empty;
  - values are validated against physical ranges and units before applying.
- **Ranking** — Earth candidates are ordered by weighted Gaussian similarity.
  Every row shows its score, the strongest matching parameters, the number of
  parameters compared, and a link to its own coordinates on OpenStreetMap.
- **Map interaction** — clicking a marker or a ranking row selects the location,
  highlights it everywhere, centers it and zooms to at least level 6. Clicks
  that end a map drag are ignored so panning does not open a profile.
- **Coordinate links** — each location builds an OpenStreetMap deep link from
  its latitude and longitude.
- **Light / dark mode** — the palette and the base map layer (CARTO dark or
  OpenStreetMap standard) switch together. The choice is stored in
  `localStorage`.
- **Contained layout** — the map fills its own section below the header,
  never overflows it, and adapts down to mobile widths.
- **Backend status** — the legend reports `Live API` or `offline mode` so it is
  clear where the scores come from.

## Similarity model

The Python engine and the browser fallback use the same formula. For every
parameter that exists in both records:

```
z = |earthValue - targetValue| / scale
score = 100 * exp(-(z * z))
```

Scores are combined with the weights defined in `analog_core.PARAMETERS` and
mirrored in the frontend `PARAMS`. A candidate with no shared parameters gets
`0%` and is labelled **No shared parameters**.

## Data

- `frontend/data/objetivos_espaciales.json` — Moon and Mars reference sites.
- `frontend/data/tierra_procesada.json` — Earth candidate sites with
  coordinates, images, references and environmental parameters.
- `data/candidatos_tierra.csv`, `data/objetivos_*.csv` — curated source tables
  used when JSON output is not available (`--source csv`).
- `backend/procesar_datos.py` — optional script that regenerates the JSON
  datasets. It needs `requirements.txt` (pandas, numpy, STAC tooling); the API
  server does not.

Environment descriptions and country names are stored in Spanish in the JSON
files and translated at render time, so the interface is English only without
changing the data contract.

## Tests

```bash
npm test
```

or, from `backend/`:

```bash
python -m unittest -v
```

The suite covers dataset loading (JSON and CSV), similarity and ordering,
missing-value handling, target validation, derived thermal range, every API
route, CORS, static serving and the injected API base.

> This is a prototype. Similarity scores come from the sample dataset and are
> not operational mission recommendations.
