<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 05 — The API

**DOC-05** &nbsp;·&nbsp; [← Documentation](README.md)

The API runs in the same Nuxt server as the site, under `/api`. It is organized like a
[DC Scaffold](https://github.com/Djason16/dc-scaffold) back end: controllers, helpers and automatic REST routes.

## 01 — Response format

```js
{ "success": true, ...data }                                    // e.g. { "success": true, "clients": [...] }
{ "success": false, "error": "message", "type": "NOT_FOUND" }   // with the right HTTP status (400, 401, 404, 429, 500...)
```

On the site, every call goes through `utils/api.js` (`api.get('/clients')`, `api.post(...)`...).
It never throws and always resolves to this format.
Error messages shown to the visitor are translation keys (e.g. `invalidCredentials`).

## 02 — Adding a route

Create `server/controllers/ProductsController.js`. Its methods become routes automatically
(restart `npm run dev` when the file is new):

| Method | Route |
| ------ | ----- |
| `getAll` | `GET /api/products` |
| `getOne` | `GET /api/products/{id}` |
| `create` | `POST /api/products` |
| `update` | `PUT` / `PATCH /api/products/{id}` |
| `delete` | `DELETE /api/products/{id}` |

```js
export default class ProductsController extends Controller {
    static publicActions = ['getAll']                               // every other route needs the admin session
    static routes = { markShipped: ['POST', '/{id}/mark-shipped'] } // routes the REST naming cannot guess

    async getAll(event) {
        return ResponseHelper.success(event, { products: await this.fetchAll('SELECT * FROM products') })
    }

    async create(event) {
        const data = await this.body(event)
        const missing = RequestHelper.missing(data, ['name'])
        if (missing.length) return ResponseHelper.validationError(event, `Missing fields: ${missing.join(', ')}`)
        const id = DatabaseHelper.newId()
        await this.insert('INSERT INTO products (id, name) VALUES (?, ?)', [id, data.name])
        return ResponseHelper.success(event, { id }, 201)
    }
}
```

Helpers in `server/helpers/` are imported automatically everywhere in `server/`.

## 03 — Database

MySQL through `mysql2` (`server/helpers/DatabaseHelper.js`), with the `DB_*` values of the `.env` file ([Configuration](02-configuration.md)).
Locally it runs in Docker (`docker-compose.yml`, started by `start.bat` → `D`); online it is the MySQL database of Infomaniak,
separate from the files of the site: a new deployment never touches it.

- **See and edit the data**: phpMyAdmin, http://localhost:8081 locally, from the Infomaniak Manager online
- **Tables**: `server/helpers/DatabaseSchema.js` (`CREATE TABLE IF NOT EXISTS`, safe on an existing database)
- **Default rows and admin account**: `server/plugins/init-database.js`, run on each start
- **Images of the projects**: stored in the `dc_uploads` table (not as files), served by `/api/upload/images/{name}`. The admin sends them in WebP (1920 px at most) with a 640 px thumbnail for the grid of the home page (`thumb-{name}`, deleted with the photo); a photo sent before the thumbnails is shown in full
- **Changing an existing table** needs its own `ALTER TABLE`: never drop or recreate a table that holds data
- **Backups**: export from phpMyAdmin; online, Infomaniak also keeps automatic backups

## 04 — Every route

🔓 = public. Every other route needs the admin session (`401` otherwise).

| Resource | Routes |
| -------- | ------ |
| API | 🔓 `GET /api` |
| Auth | 🔓 `GET /api/auth/check-session`, 🔓 `POST /api/auth/login`, 🔓 `POST /api/auth/verify-otp`, 🔓 `POST /api/auth/logout`, 🔓 `POST /api/auth/send-temp-password`, `POST /api/auth/update-password` |
| Clients | `GET /api/clients`, `POST /api/clients`, `PUT /api/clients/{id}`, `DELETE /api/clients/{id}` |
| Missions | `GET /api/missions`, `POST /api/missions`, `PUT /api/missions/{id}`, `DELETE /api/missions/{id}` |
| Services | `GET /api/services` |
| Interest rates | `GET /api/interest-rates`, `POST /api/interest-rates`, `PUT /api/interest-rates/{id}`, `DELETE /api/interest-rates/{id}` |
| Projects | 🔓 `GET /api/projects`, `POST /api/projects` (multipart), `PUT /api/projects/{id}`, `POST /api/projects/{id}/image`, `DELETE /api/projects/{id}` |
| Skills | 🔓 `GET /api/skills`, `POST /api/skills`, `PUT /api/skills/{id}`, `DELETE /api/skills/{id}` |
| Versions | 🔓 `GET /api/versions` (`{ versions: { dc_skills: 4, ... } }`: the tables of the public pages for a visitor, every table for the admin) |
| Translation | `POST /api/translate` (`{ text, from: 'fr', to: ['en'] }`, MyMemory: `server/helpers/TranslateHelper.js`) |
| Calendar | 🔓 `GET /api/calendar`, `PUT` / `PATCH /api/calendar/{id}`, `POST /api/calendar/send-agenda` |
| Unavailability | 🔓 `GET /api/unavailability`, `POST /api/unavailability`, `PUT /api/unavailability/{id}`, `DELETE /api/unavailability/{id}` |
| Availability | 🔓 `GET /api/availability`, `PUT /api/availability/toggle` |
| Bank | `GET /api/bank` |
| Environment | `GET /api/env`, `PUT /api/env` |
| My info | 🔓 `GET /api/settings`, `PUT /api/settings`, `POST /api/settings/photo`, `DELETE /api/settings/photo` |
| Quotes & invoices | `GET /api/documents`, `POST /api/documents`, `PUT /api/documents/{id}`, `DELETE /api/documents/{id}` (draft), `POST /api/documents/{id}/finalize`, `POST /api/documents/{id}/status`, `POST /api/documents/{id}/duplicate`, `POST /api/documents/{id}/invoice`, `POST /api/documents/{id}/payments`, `POST /api/documents/{id}/pay-link`, `POST /api/documents/{id}/autopay-stop`, `DELETE /api/documents/{id}/payments/{paymentId}` |
| Withdrawal | `POST /api/withdrawals` (public, 5 per hour and per address), `GET /api/withdrawals` |
| Site texts | 🔓 `GET /api/texts`, `PUT /api/texts` (`{ lang, key, value }`, empty = original text) |
| Stripe | 🔓 `GET /api/stripe/document?token=` (payment link), 🔓 `POST /api/stripe/webhook` (signed by Stripe), 🔓 `POST /api/stripe/create-checkout` (`{ token, email }` for a payment link), 🔓 `POST /api/stripe/create-subscription`, 🔓 `GET /api/stripe/check-payment`, 🔓 `GET /api/stripe/check-subscription`, 🔓 `GET /api/stripe/payment-result`, 🔓 `GET /api/stripe/subscription-result` |
| Uploads | 🔓 `GET /api/upload/images/{file}` |

---

<p align="center"><sub><a href="04-site.md">← 04 — The site</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="06-admin-documents.md">06 — Admin & documents →</a></sub></p>
