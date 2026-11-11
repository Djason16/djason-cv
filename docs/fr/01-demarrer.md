<p align="center"><img src="../assets/docs-fr.png" alt="Documentation" width="100%" /></p>

# 01 — Démarrer

**DOC-01** &nbsp;·&nbsp; [← Documentation](README.md)

## 01 — Prérequis

- **Node.js 22.16 ou plus** (24 LTS conseillé)
- **npm 10 ou plus**
- **Docker Desktop** : la base MySQL locale et phpMyAdmin tournent dedans (`docker-compose.yml`)

```bash
node -v   # >= 22.16.0
npm -v    # >= 10.0.0
```

## 02 — Windows : `start.bat`

Double-clique sur `start.bat` à la racine du projet, puis choisis :

| Touche | Action | Quand |
| ------ | ------ | ----- |
| `D` | Développement | Installe ce qui manque, puis lance MySQL + phpMyAdmin (Docker) et le site, chacun dans une nouvelle fenêtre |
| `S` | Arrêter | Arrête MySQL et phpMyAdmin (`docker compose down`) |
| `I` | Installer | Installe ou met à jour les modules npm de `frontend/` |
| `B` | Build | `npm run build` : version de production (site + API) |

Choix direct depuis un terminal : `.\start.ps1 -Action D`.
Même lanceur que [DC Scaffold](https://github.com/Djason16/dc-scaffold) (`start.bat`, `start.ps1`, `scripts/common.ps1`).

## 03 — Mac / Linux

```bash
git clone https://github.com/Djason16/djason-cv.git
cd djason-cv/frontend
cp .env.example .env   # puis remplis tes valeurs, voir Configuration
docker compose --project-directory .. --env-file .env up -d   # MySQL + phpMyAdmin
npm install
npm run dev
```

## 04 — Première installation

1. Installe Node.js 22.16+
2. Clone le dépôt
3. Copie `frontend/.env.example` en `frontend/.env` et remplis-le, avec un long `DB_PASS` aléatoire : il devient aussi le mot de passe du MySQL local ([Configuration](02-configuration.md))
4. Ajoute tes clés Stripe **de test**
5. Lance `npm install` dans `frontend/`, puis `npm run dev` (ou `start.bat` → `D`)

| Service | Adresse |
| ------- | ------- |
| Site | http://localhost:3000 |
| API | http://localhost:3000/api |
| phpMyAdmin | http://localhost:8081 (utilisateur `root`, mot de passe : `DB_PASS` de `frontend/.env`) |

## 05 — Scripts npm (dans `frontend/`)

| Commande | Ce qu'elle fait |
| -------- | --------------- |
| `npm run dev` | Serveur de développement, recharge à chaque modification |
| `npm run build` | Version de production dans `.output/` |
| `npm run start` | Lance la version de production avec `.env.production` |
| `npm run preview` | Aperçu local de la version de production |

---

<p align="center"><sub><a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="02-configuration.md">02 — Configuration →</a></sub></p>
