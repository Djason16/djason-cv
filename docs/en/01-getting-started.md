<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 01 — Getting started

**DOC-01** &nbsp;·&nbsp; [← Documentation](README.md)

## 01 — Requirements

- **Node.js 22.16 or higher** (24 LTS recommended)
- **npm 10 or higher**
- **Docker Desktop**: the local MySQL database and phpMyAdmin run in it (`docker-compose.yml`)

```bash
node -v   # >= 22.16.0
npm -v    # >= 10.0.0
```

## 02 — Windows: `start.bat`

Double-click `start.bat` at the project root, then choose:

| Key | Action | When |
| --- | ------ | ---- |
| `D` | Development | Installs what is missing, then starts MySQL + phpMyAdmin (Docker) and the site, each in a new window |
| `S` | Stop | Stops MySQL and phpMyAdmin (`docker compose down`) |
| `I` | Install | Installs or updates the npm dependencies of `app/` |
| `B` | Build front | `npm run build`: production build (site + API) |

Direct choice from a terminal: `.\start.ps1 -Action D`.
Same launcher as [DC Scaffold](https://github.com/Djason16/dc-scaffold) (`start.bat`, `start.ps1`, `scripts/common.ps1`).

## 03 — Mac / Linux

```bash
git clone https://github.com/Djason16/djason-cv.git
cd djason-cv/app
cp .env.example .env   # then fill in your values, see Configuration
docker compose --project-directory .. --env-file .env up -d   # MySQL + phpMyAdmin
npm install
npm run dev
```

## 04 — First-time checklist

1. Install Node.js 22.16+
2. Clone the repository
3. Copy `app/.env.example` to `app/.env` and fill it in, with a long random `DB_PASS`: it also becomes the password of the local MySQL ([Configuration](02-configuration.md))
4. Add your Stripe **test** keys
5. Run `npm install` in `app/`, then `npm run dev` (or `start.bat` → `D`)

| Service | URL |
| ------- | --- |
| Site | http://localhost:3000 |
| API | http://localhost:3000/api |
| phpMyAdmin | http://localhost:8081 (user `root`, password: `DB_PASS` of `app/.env`) |

## 05 — npm scripts (in `app/`)

| Command | What it does |
| ------- | ------------ |
| `npm run dev` | Development server, reloads on every change |
| `npm run build` | Production build in `.output/` |
| `npm run start` | Starts the production build with `.env.production` |
| `npm run preview` | Previews the production build locally |

---

<p align="center"><sub><a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="02-configuration.md">02 — Configuration →</a></sub></p>
