# 1. Démarrer

[← Documentation](README.md)

## Prérequis

- **Node.js 22.16 ou plus** (24 LTS conseillé) : la base de données utilise `node:sqlite`, intégré à Node.js
- **npm 10 ou plus**

```bash
node -v   # >= 22.16.0
npm -v    # >= 10.0.0
```

## Windows : `start.bat`

Double-clique sur `start.bat` à la racine du projet, puis choisis :

| Touche | Action | Quand |
| ------ | ------ | ----- |
| `D` | Développement | Installe ce qui manque, puis lance le site dans une nouvelle fenêtre |
| `I` | Installer | Installe ou met à jour les modules npm de `app/` |
| `B` | Build | `npm run build` : version de production (site + API) |

Choix direct depuis un terminal : `.\start.ps1 -Action D`.
Même lanceur que [DC Scaffold](https://github.com/Djason16/dc-scaffold) (`start.bat`, `start.ps1`, `scripts/common.ps1`).

## Mac / Linux

```bash
git clone https://github.com/Djason16/djason-cv.git
cd djason-cv/app
cp .env.example .env   # puis remplis tes valeurs, voir Configuration
npm install
npm run dev
```

## Première installation

1. Installe Node.js 22.16+
2. Clone le dépôt
3. Copie `app/.env.example` en `app/.env` et remplis-le ([Configuration](02-configuration.md))
4. Ajoute tes clés Stripe **de test**
5. Lance `npm install` dans `app/`, puis `npm run dev` (ou `start.bat` → `D`)

| Service | Adresse |
| ------- | ------- |
| Site | http://localhost:3000 |
| API | http://localhost:3000/api |

## Scripts npm (dans `app/`)

| Commande | Ce qu'elle fait |
| -------- | --------------- |
| `npm run dev` | Serveur de développement, recharge à chaque modification |
| `npm run build` | Version de production dans `.output/` |
| `npm run start` | Lance la version de production avec `.env.production` |
| `npm run generate` | Site statique (sans l'API) |
| `npm run preview` | Aperçu local de la version de production |
