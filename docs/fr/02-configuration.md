<p align="center"><img src="../assets/docs-fr.png" alt="Documentation" width="100%" /></p>

# 02 — Configuration

**DOC-02** &nbsp;·&nbsp; [← Documentation](README.md)

Les réglages sont dans des fichiers `.env` dans `frontend/` : seulement ce qui est **secret ou technique** (base de données, Stripe, SMTP, compte admin, banque, adresse du site).
Ton nom, ton contact, tes mentions légales et tes réseaux sociaux se modifient dans **admin → Mes infos** (gardés dans la base, appliqués tout de suite).
Les textes vus par les visiteurs (accueil, pages légales, bandeau cookies, SEO, page Payez-moi, et les textes imprimés sur les devis, factures et contrats) se modifient dans **admin → Textes du site** : le site change tout de suite, sans nouveau build.

Pars de l'exemple :

```bash
cp .env.example .env
```

| Fichier | Utilisé par |
| ------- | ----------- |
| `.env` | Le développement (`npm run dev`), lu aussi par Docker pour le MySQL local |
| `.env.production` | La production (`npm run build`, `npm run start`) |
| `.env.example` | Le modèle, le seul envoyé sur Git |

> ⚠️ N'envoie jamais `.env` ou `.env.production` sur Git (ils sont dans `.gitignore`).
> Les valeurs du serveur (clé secrète Stripe, SMTP, banque, compte admin) sont lues à la construction du site : **refais un build après les avoir changées**.

## 01 — Variables

| Variable | Ce que c'est |
| -------- | ------------ |
| **Mode** | |
| `NODE_ENV` | `development` ou `production` |
| **Site** (public) | |
| `NUXT_PUBLIC_FRONTEND_DOMAIN` | Adresse du site (`http://localhost:3000` en développement) |
| **Base de données** | |
| `DB_HOST`, `DB_PORT` | Serveur MySQL : `localhost` et `3306` en local (Docker), le serveur donné par Infomaniak en ligne |
| `DB_NAME`, `DB_USER`, `DB_PASS` | Base, utilisateur et mot de passe. En local `djason_cv` / `root` / un long mot de passe aléatoire |
| **Compte admin** (créé au premier démarrage) | |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Identifiants de l'espace admin |
| `SECURITY_ANSWER` | Réponse demandée pour réinitialiser le mot de passe |
| **E-mails (SMTP)** | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Serveur qui envoie les codes de connexion et les e-mails |
| **Paiements (Stripe)** | |
| `STRIPE_SECRET_KEY` | Clé secrète (serveur uniquement) |
| `STRIPE_WEBHOOK_SECRET` | Secret de signature du webhook `/api/stripe/webhook` (`whsec_...`) : donné par `stripe listen` en local, par le Dashboard en ligne |
| **Banque** (serveur uniquement, jamais envoyée au navigateur) | |
| `BANK_IBAN`, `BANK_BIC` | Imprimés sur les factures et contrats |
| **Traduction** (MyMemory, gratuit, sans clé) | |
| `MYMEMORY_EMAIL` | Facultatif. Vide : environ 5 000 caractères traduits par jour ; un e-mail : environ 50 000 |
| `GOOGLE_MAPS_API_KEY` | Clé de l'API Google Geocoding (côté serveur) : la région d'une adresse hors de France, affichée sur le site au lieu de la ville. En France : le service public geo.api.gouv.fr. Vide : le pays seulement |

L'ordre est celui de `.env.example` et d'admin → Environnement (une variable absente y apparaît vide : la remplir l'ajoute au fichier).

Tout ce qui commence par `NUXT_PUBLIC_` est visible dans le navigateur : n'y mets jamais de secret.

## 02 — Production

Crée `.env.production` avec les mêmes variables et les vraies valeurs : domaine, clés Stripe **live**, vrai SMTP...
Elles peuvent aussi être modifiées plus tard depuis la page admin (Environnement), qui les réécrit dans le `.env` du mode en cours.

## 03 — Base locale (Docker)

Le MySQL local (`docker-compose.yml`) lit le même `.env` que le site : `start.bat` le donne à Docker.

| Variable | Pour Docker |
| -------- | ----------- |
| `DB_PASS` | Mot de passe de `root`, l'utilisateur avec lequel le site se connecte en local (comme DC Scaffold) |
| `DB_NAME` | Nom de la base créée au premier démarrage |
| `DB_PORT` | Port de MySQL sur cet ordinateur |

Utilise un long mot de passe aléatoire.
MySQL ne lit le mot de passe qu'à la création de `database/` : pour le changer ensuite, change-le aussi dans MySQL (phpMyAdmin → Comptes utilisateurs).

---

<p align="center"><sub><a href="01-demarrer.md">← 01 — Démarrer</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="03-architecture.md">03 — Architecture →</a></sub></p>
