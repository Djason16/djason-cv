# 1. Getting started

[← Documentation](README.md)

## Requirements

- **Node.js 22.16 or higher** (24 LTS recommended): the database uses `node:sqlite`, built into Node.js
- **npm 10 or higher**

```bash
node -v   # >= 22.16.0
npm -v    # >= 10.0.0
```

## Windows: `start.bat`

Double-click `start.bat` at the project root, then choose:

| Key | Action | When |
| --- | ------ | ---- |
| `D` | Development | Installs what is missing, then starts the site in a new window |
| `I` | Install | Installs or updates the npm dependencies of `app/` |
| `B` | Build front | `npm run build`: production build (site + API) |

Direct choice from a terminal: `.\start.ps1 -Action D`.
Same launcher as [DC Scaffold](https://github.com/Djason16/dc-scaffold) (`start.bat`, `start.ps1`, `scripts/common.ps1`).

## Mac / Linux

```bash
git clone https://github.com/Djason16/djason-cv.git
cd djason-cv/app
cp .env.example .env   # then fill in your values, see Configuration
npm install
npm run dev
```

## First-time checklist

1. Install Node.js 22.16+
2. Clone the repository
3. Copy `app/.env.example` to `app/.env` and fill it in ([Configuration](02-configuration.md))
4. Add your Stripe **test** keys
5. Run `npm install` in `app/`, then `npm run dev` (or `start.bat` → `D`)

| Service | URL |
| ------- | --- |
| Site | http://localhost:3000 |
| API | http://localhost:3000/api |

## npm scripts (in `app/`)

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Development server, reloads on every change |
| `npm run build` | Production build in `.output/` |
| `npm run start` | Starts the production build with `.env.production` |
| `npm run generate` | Static site (without the API) |
| `npm run preview` | Previews the production build locally |
