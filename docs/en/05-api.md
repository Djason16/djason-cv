# 5. The API

[← Documentation](README.md)

The API runs in the same Nuxt server as the site, under `/api`. It is organized like a
[DC Scaffold](https://github.com/Djason16/dc-scaffold) back end: controllers, helpers and automatic REST routes.

## Response format

```js
{ "success": true, ...data }                                    // e.g. { "success": true, "clients": [...] }
{ "success": false, "error": "message", "type": "NOT_FOUND" }   // with the right HTTP status (400, 401, 404, 429, 500...)
```

On the site, every call goes through `utils/api.js` (`api.get('/clients')`, `api.post(...)`...).
It never throws and always resolves to this format.
Error messages shown to the visitor are translation keys (e.g. `invalidCredentials`).

## Adding a route

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
        const id = DatabaseHelper.uuid()
        await this.insert('INSERT INTO products (id, name) VALUES (?, ?)', [id, data.name])
        return ResponseHelper.success(event, { id }, 201)
    }
}
```

Helpers in `server/helpers/` are imported automatically everywhere in `server/`.

## Database

SQLite through `node:sqlite` (built into Node.js), in `.data/db.sqlite` (or `DB_FILE`).

- Tables: `server/helpers/DatabaseSchema.js` (`CREATE TABLE IF NOT EXISTS`, safe on an existing database)
- Default rows and admin account: `server/plugins/init-database.js`, run on each start
- **Changing an existing table** needs its own `ALTER TABLE`: never drop or recreate a table that holds data
- Backup and restore: from the admin page (download `.sqlite`, export `.sql`, replace the database)

## Every route

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
| Calendar | 🔓 `GET /api/calendar`, `PUT` / `PATCH /api/calendar/{id}`, `POST /api/calendar/send-agenda` |
| Unavailability | 🔓 `GET /api/unavailability`, `POST /api/unavailability`, `PUT /api/unavailability/{id}`, `DELETE /api/unavailability/{id}` |
| Availability | 🔓 `GET /api/availability`, `PUT /api/availability/toggle` |
| Bank | `GET /api/bank` |
| Environment | `GET /api/env`, `PUT /api/env` |
| Database | 🔓 `GET /api/database/setup` (state only), `GET /api/database/download-db`, `GET /api/database/export-sql`, `POST /api/database/replace-db` |
| Stripe | 🔓 `POST /api/stripe/create-checkout`, 🔓 `POST /api/stripe/create-subscription`, 🔓 `GET /api/stripe/check-payment`, 🔓 `GET /api/stripe/check-subscription`, 🔓 `GET /api/stripe/payment-result`, 🔓 `GET /api/stripe/subscription-result` |
| Uploads | 🔓 `GET /api/upload/images/{file}` |
