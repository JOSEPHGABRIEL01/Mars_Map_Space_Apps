# NASA Analog Finder

Leaflet frontend plus a Python backend that rank Earth locations by how closely
their environmental parameters resemble a Moon or Mars reference site.

The frontend is plain HTML, CSS and JavaScript with no build step. The backend
uses only the Python standard library, so no packages are required just to run
the app.

## Run it

### Recommended: one server for the API and the app

```bash
cd nasa-analog-finder
python backend/server.py
```

Open <http://127.0.0.1:8000>. The server serves the frontend, injects
`window.ANALOG_API_BASE = "/api"` into `index.html`, and answers the JSON API
with the same similarity formula the frontend uses offline.

Options:

```bash
python backend/server.py --host 0.0.0.0 --port 8080
python backend/server.py --source csv        # use the curated CSV tables
python backend/server.py --data-dir ../data --frontend-dir ./frontend
```

### Offline: static frontend only

```bash
cd nasa-analog-finder/frontend
python -m http.server 8080
```

Open <http://localhost:8080>. Without the injected API base the page runs in
**offline mode**: it loads the bundled JSON datasets and scores candidates in
the browser. A `?api=` query parameter can point the page at a running backend:

```
http://localhost:8080/?api=http://127.0.0.1:8000/api
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
cd nasa-analog-finder/backend
python -m unittest -v
```

The suite covers dataset loading (JSON and CSV), similarity and ordering,
missing-value handling, target validation, derived thermal range, every API
route, CORS, static serving and the injected API base.

> This is a prototype. Similarity scores come from the sample dataset and are
> not operational mission recommendations.
