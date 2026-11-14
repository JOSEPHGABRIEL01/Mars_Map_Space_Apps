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

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the development server         |
| `npm run build`   | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## Project structure

```
src/
├── assets/       Images and static assets imported by components
├── components/   Reusable UI components (+ CSS Modules)
├── data/         Mock (DEMO) data layer
├── hooks/        Custom React hooks
├── styles/       Global styles and design tokens
├── utils/        Helper functions
├── App.jsx       Application shell and stage navigation
└── main.jsx      Application entry point
```

## Branch workflow

- `main` — stable branch, always deployable.
- `roger` — personal working branch.
- Feature branches — `feat/<short-name>`, merged through pull requests.

Commit messages follow a light Conventional Commits style: `feat:`, `fix:`, `chore:`, `docs:`.
