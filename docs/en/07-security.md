<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 07 — Security

**DOC-07** &nbsp;·&nbsp; [← Documentation](README.md)

## 01 — Admin login

Email and password, then a one-time code sent by email. The forgotten password flow asks the security answer
(`SECURITY_ANSWER`) and sends a temporary password.

## 02 — Protected routes

The session is checked by the API router (`server/api/[...path].js`) on the route that was matched,
so `/api/env`, `/api/env/` and `/api//env` are the same protected route.
Only the actions listed in a controller's `publicActions` are public ([every route](05-api.md#04--every-route)).

`robots.txt` is **not** a protection: it only guides search engines.

## 03 — Rate limits

Failed attempts are stored in the database (`dc_rate_limits`), per account and per IP:

| Attempt | Limit | Locked for |
| ------- | ----- | ---------- |
| Wrong password | 5 | 15 minutes |
| Wrong one-time code | 5 | 15 minutes |
| Wrong security answer | 3 | 1 hour |

## 04 — Uploads

- Only JPG, PNG, GIF, WEBP and AVIF images, stored in the database (`dc_uploads`)

## 05 — Secrets

- Stripe secret key, SMTP, database password, bank details and admin account stay on the server: never in a `NUXT_PUBLIC_` variable
- `.env` files are never committed

---

<p align="center"><sub><a href="06-admin-documents.md">← 06 — Admin & documents</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="08-deployment.md">08 — Deployment →</a></sub></p>
