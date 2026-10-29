# 2. Configuration

[← Documentation](README.md)

Settings live in `.env` files inside `app/`. Start from the example:

```bash
cp .env.example .env
```

| File | Used by |
| ---- | ------- |
| `.env` | Development (`npm run dev`). An old `.env.development` is still read when there is no `.env` |
| `.env.production` | Production (`npm run build`, `npm run start`) |
| `.env.example` | The template, the only one committed to Git |

> ⚠️ Never commit `.env`, `.env.development` or `.env.production` (they are in `.gitignore`).
> Server values (Stripe secret key, SMTP, bank details, admin account) are read when the site is built: **rebuild after changing them**.

## Variables

| Variable | What it is |
| -------- | ---------- |
| **Environment** | |
| `NODE_ENV` | `development` or `production` |
| `NUXT_PUBLIC_FRONTEND_DOMAIN` | Address of the site (`http://localhost:3000` in development) |
| **Stripe** | |
| `NUXT_PUBLIC_STRIPE_PUBLIC_KEY` | Public key (sent to the browser) |
| `STRIPE_SECRET_KEY` | Secret key (server only) |
| **Admin account** (created on the first start) | |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | Login of the admin space |
| `SECURITY_ANSWER` | Answer asked to reset the password |
| **Email (SMTP)** | |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Server used to send the login codes and emails |
| **Identity** (shown on the site) | |
| `NUXT_PUBLIC_PERSONAL_NAME`, `NUXT_PUBLIC_PERSONAL_EMAIL`, `NUXT_PUBLIC_PERSONAL_PHONE`, `NUXT_PUBLIC_PERSONAL_BIRTHDATE` | Name, contact and birth date |
| **Legal & billing** (legal pages and documents) | |
| `NUXT_PUBLIC_LEGAL_SIRET`, `NUXT_PUBLIC_LEGAL_TVA` | SIRET and VAT numbers |
| `NUXT_PUBLIC_LEGAL_ADDRESS`, `NUXT_PUBLIC_LEGAL_INVOICE_ADDRESS` | Public address and invoice address |
| **Bank** (server only, never sent to the browser) | |
| `BANK_IBAN`, `BANK_BIC` | Printed on invoices and contracts |
| **Social links** (footer) | |
| `NUXT_PUBLIC_LINKEDIN`, `NUXT_PUBLIC_GITHUB`, `NUXT_PUBLIC_MALT`, `NUXT_PUBLIC_INSTAGRAM`, `NUXT_PUBLIC_WHATSAPP` | Full URLs |
| **Database** | |
| `DB_REPLACE_TRIGGER` | Increased automatically after a database replacement from the admin page, so the dev server reloads. Leave it |
| `DB_FILE` | Optional: path of the SQLite file (default `.data/db.sqlite`) |

Everything starting with `NUXT_PUBLIC_` is visible in the browser: never put a secret there.

## Production

Create `.env.production` with the same variables and the real values: domain, Stripe **live** keys, real SMTP...
They can also be edited later from the admin page, which writes them back to the `.env` file of the current mode.
