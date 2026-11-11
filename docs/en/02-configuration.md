<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 02 — Configuration

**DOC-02** &nbsp;·&nbsp; [← Documentation](README.md)

Settings live in `.env` files inside `frontend/`: only what is **secret or technical** (database, Stripe, SMTP, admin account, bank details, address of the site).
Your name, contact, legal details and social links are edited in **admin → My info** (stored in the database, applied at once).
The texts seen by visitors (home, legal pages, cookie banner, SEO, Pay me page, and the texts printed on the quotes, invoices and contracts) are edited in **admin → Site texts**: the site changes at once, without a new build.

Start from the example:

```bash
cp .env.example .env
```

| File | Used by |
| ---- | ------- |
| `.env` | Development (`npm run dev`), also read by Docker for the local MySQL |
| `.env.production` | Production (`npm run build`, `npm run start`) |
| `.env.example` | The template, the only one committed to Git |

> ⚠️ Never commit `.env` or `.env.production` (they are in `.gitignore`).
> Server values (Stripe secret key, SMTP, bank details, admin account) are read when the site is built: **rebuild after changing them**.

## 01 — Variables

| Variable | What it is |
| -------- | ---------- |
| **Mode** | |
| `NODE_ENV` | `development` or `production` |
| **Site** (public) | |
| `NUXT_PUBLIC_FRONTEND_DOMAIN` | Address of the site (`http://localhost:3000` in development) |
| **Database** | |
| `DB_HOST`, `DB_PORT` | MySQL server: `localhost` and `3306` locally (Docker), the server given by Infomaniak online |
| `DB_NAME`, `DB_USER`, `DB_PASS` | Database, user and password. Locally `djason_cv` / `root` / a long random password |
| **Admin account** (created on the first start) | |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Login of the admin space |
| `SECURITY_ANSWER` | Answer asked to reset the password |
| **Emails (SMTP)** | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Server used to send the login codes and emails |
| **Payments (Stripe)** | |
| `STRIPE_SECRET_KEY` | Secret key (server only) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret of the webhook `/api/stripe/webhook` (`whsec_...`): locally given by `stripe listen`, online by the Dashboard |
| **Bank** (server only, never sent to the browser) | |
| `BANK_IBAN`, `BANK_BIC` | Printed on invoices and contracts |
| **Translation** (MyMemory, free, no key) | |
| `MYMEMORY_EMAIL` | Optional. Empty: about 5,000 translated characters a day; an email: about 50,000 |
| `GOOGLE_MAPS_API_KEY` | Google Geocoding API key (server side): the region of an address outside France, shown on the site instead of the town. In France: the public service geo.api.gouv.fr. Empty: the country only |

The order is the one of `.env.example` and of admin → Environment (a missing variable shows empty there: filling it adds it to the file).

Everything starting with `NUXT_PUBLIC_` is visible in the browser: never put a secret there.

## 02 — Production

Create `.env.production` with the same variables and the real values: domain, Stripe **live** keys, real SMTP...
They can also be edited later from the admin page (Environment), which writes them back to the `.env` file of the current mode.

## 03 — Local database (Docker)

The local MySQL (`docker-compose.yml`) reads the same `.env` as the site: `start.bat` gives it to Docker.

| Variable | For Docker |
| -------- | ---------- |
| `DB_PASS` | Password of `root`, the user the site logs in with locally (like DC Scaffold) |
| `DB_NAME` | Name of the database created on the first start |
| `DB_PORT` | Port of MySQL on this computer |

Use a long random password.
MySQL reads the password only when `database/` is created: to change it later, change it in MySQL too (phpMyAdmin → User accounts).

---

<p align="center"><sub><a href="01-getting-started.md">← 01 — Getting started</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="03-architecture.md">03 — Architecture →</a></sub></p>
