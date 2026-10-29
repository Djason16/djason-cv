# 7. Security

[← Documentation](README.md)

## Admin login

Email and password, then a one-time code sent by email. The forgotten password flow asks the security answer
(`SECURITY_ANSWER`) and sends a temporary password.

## Protected routes

The session is checked by the API router (`server/api/[...path].js`) on the route that was matched,
so `/api/env`, `/api/env/` and `/api//env` are the same protected route.
Only the actions listed in a controller's `publicActions` are public ([every route](05-api.md#every-route)).

`robots.txt` and `.htaccess` are **not** a protection: they only guide search engines.

## Rate limits

Failed attempts are stored in the database (`dc_rate_limits`), per account and per IP:

| Attempt | Limit | Locked for |
| ------- | ----- | ---------- |
| Wrong password | 5 | 15 minutes |
| Wrong one-time code | 5 | 15 minutes |
| Wrong security answer | 3 | 1 hour |

## Uploads

- Only JPG, PNG, GIF, WEBP and AVIF images
- A database replacement must be a valid SQLite file of this site

## Secrets

- Stripe secret key, SMTP, bank details and admin account stay on the server: never in a `NUXT_PUBLIC_` variable
- `.env` files are never committed
