# NASA Analog Finder

NASA Analog Finder is a Vite-powered Leaflet frontend with a Python data
pipeline. It ranks Earth environments against Moon and Mars reference sites
using the bundled scientific datasets.

## Run the application

From `nasa-analog-finder/`:

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally <http://localhost:5173>.

The production build can be checked with:

```bash
npm run build
npm run preview
```

Vite exposes `frontend/data/` as `/data/`, so the Python pipeline remains the
single source for the generated JSON files. The development server proxies
`/api` to `http://127.0.0.1:8000` when the optional Python API is available;
without it, the browser uses the bundled offline scoring path.

## Project layout

```text
index.html                 Vite entry point
src/main.js                Vite entry module
frontend/app.js            Application logic and offline fallback
frontend/styles.css        Application styles
frontend/data/             Generated JSON served by Vite as /data/
backend/                   Data processing scripts
data/                      CSV sources and generated exports
```

There is intentionally one HTML entry point: `index.html` at the project root.
Run it through Vite rather than opening it directly with `file://`.

## Data pipeline

Install Python dependencies with:

```bash
python -m pip install -r backend/requirements.txt
```

The deterministic unified collector can regenerate the datasets with:

```bash
python backend/recolectar_todo.py --modo rapido
```

It generates the Moon, Mars and Earth CSV exports, the frontend JSON files and
the provenance CSV. The existing Earth-only collector remains available for
focused data generation:

```bash
python backend/automatizar_tierra.py --fast-seed
```

## Frontend features

- Leaflet map with CARTO dark tiles and OpenStreetMap standard tiles.
- Light/dark theme switch.
- Moon and Mars reference targets.
- Custom target parameters.
- Top 50, Top 100 and all-place map limits.
- Ranking scores and detailed parameter comparisons.
- Optional Python API with browser fallback when the API is unavailable.

## Verification

```bash
node --check frontend/app.js
npm run build
```

The JSON datasets should be treated as generated outputs rather than manually
edited files.
