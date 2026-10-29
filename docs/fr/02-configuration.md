# 2. Configuration

[← Documentation](README.md)

Les réglages sont dans des fichiers `.env` dans `app/`. Pars de l'exemple :

```bash
cp .env.example .env
```

| Fichier | Utilisé par |
| ------- | ----------- |
| `.env` | Le développement (`npm run dev`). Un ancien `.env.development` est encore lu s'il n'y a pas de `.env` |
| `.env.production` | La production (`npm run build`, `npm run start`) |
| `.env.example` | Le modèle, le seul envoyé sur Git |

> ⚠️ N'envoie jamais `.env`, `.env.development` ou `.env.production` sur Git (ils sont dans `.gitignore`).
> Les valeurs du serveur (clé secrète Stripe, SMTP, banque, compte admin) sont lues à la construction du site : **refais un build après les avoir changées**.

## Variables

| Variable | Ce que c'est |
| -------- | ------------ |
| **Environnement** | |
| `NODE_ENV` | `development` ou `production` |
| `NUXT_PUBLIC_FRONTEND_DOMAIN` | Adresse du site (`http://localhost:3000` en développement) |
| **Stripe** | |
| `NUXT_PUBLIC_STRIPE_PUBLIC_KEY` | Clé publique (envoyée au navigateur) |
| `STRIPE_SECRET_KEY` | Clé secrète (serveur uniquement) |
| **Compte admin** (créé au premier démarrage) | |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Identifiants de l'espace admin |
| `SECURITY_ANSWER` | Réponse demandée pour réinitialiser le mot de passe |
| **E-mail (SMTP)** | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Serveur qui envoie les codes de connexion et les e-mails |
| **Identité** (affichée sur le site) | |
| `NUXT_PUBLIC_PERSONAL_NAME`, `NUXT_PUBLIC_PERSONAL_EMAIL`, `NUXT_PUBLIC_PERSONAL_PHONE`, `NUXT_PUBLIC_PERSONAL_BIRTHDATE` | Nom, contact et date de naissance |
| **Mentions légales et facturation** (pages légales et documents) | |
| `NUXT_PUBLIC_LEGAL_SIRET`, `NUXT_PUBLIC_LEGAL_TVA` | Numéros SIRET et TVA |
| `NUXT_PUBLIC_LEGAL_ADDRESS`, `NUXT_PUBLIC_LEGAL_INVOICE_ADDRESS` | Adresse publique et adresse de facturation |
| **Banque** (serveur uniquement, jamais envoyée au navigateur) | |
| `BANK_IBAN`, `BANK_BIC` | Imprimés sur les factures et contrats |
| **Réseaux sociaux** (pied de page) | |
| `NUXT_PUBLIC_LINKEDIN`, `NUXT_PUBLIC_GITHUB`, `NUXT_PUBLIC_MALT`, `NUXT_PUBLIC_INSTAGRAM`, `NUXT_PUBLIC_WHATSAPP` | Adresses complètes |
| **Base de données** | |
| `DB_REPLACE_TRIGGER` | Augmenté tout seul après un remplacement de la base depuis l'admin, pour recharger le serveur de développement. N'y touche pas |
| `DB_FILE` | Facultatif : chemin du fichier SQLite (par défaut `.data/db.sqlite`) |

Tout ce qui commence par `NUXT_PUBLIC_` est visible dans le navigateur : n'y mets jamais de secret.

## Production

Crée `.env.production` avec les mêmes variables et les vraies valeurs : domaine, clés Stripe **live**, vrai SMTP...
Elles peuvent aussi être modifiées plus tard depuis la page admin, qui les réécrit dans le `.env` du mode en cours.
