# 5. L'API

[← Documentation](README.md)

L'API tourne dans le même serveur Nuxt que le site, sous `/api`. Elle est organisée comme un back end
[DC Scaffold](https://github.com/Djason16/dc-scaffold) : contrôleurs, helpers et routes REST automatiques.

## Format des réponses

```js
{ "success": true, ...donnees }                                 // ex. { "success": true, "clients": [...] }
{ "success": false, "error": "message", "type": "NOT_FOUND" }   // avec le bon statut HTTP (400, 401, 404, 429, 500...)
```

Côté site, chaque appel passe par `utils/api.js` (`api.get('/clients')`, `api.post(...)`...).
Il ne lève jamais d'erreur et renvoie toujours ce format.
Les messages d'erreur affichés au visiteur sont des clés de traduction (ex. `invalidCredentials`).

## Ajouter une route

Crée `server/controllers/ProductsController.js`. Ses méthodes deviennent des routes toutes seules
(relance `npm run dev` si le fichier est nouveau) :

| Méthode | Route |
| ------- | ----- |
| `getAll` | `GET /api/products` |
| `getOne` | `GET /api/products/{id}` |
| `create` | `POST /api/products` |
| `update` | `PUT` / `PATCH /api/products/{id}` |
| `delete` | `DELETE /api/products/{id}` |

```js
export default class ProductsController extends Controller {
    static publicActions = ['getAll']                               // toutes les autres routes demandent la session admin
    static routes = { markShipped: ['POST', '/{id}/mark-shipped'] } // routes que le nommage REST ne peut pas deviner

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

Les helpers de `server/helpers/` sont importés automatiquement partout dans `server/`.

## Base de données

SQLite avec `node:sqlite` (intégré à Node.js), dans `.data/db.sqlite` (ou `DB_FILE`).

- Tables : `server/helpers/DatabaseSchema.js` (`CREATE TABLE IF NOT EXISTS`, sans risque sur une base existante)
- Lignes par défaut et compte admin : `server/plugins/init-database.js`, lancé à chaque démarrage
- **Modifier une table existante** demande son propre `ALTER TABLE` : ne supprime ou ne recrée jamais une table qui contient des données
- Sauvegarde et restauration : depuis la page admin (télécharger le `.sqlite`, exporter en `.sql`, remplacer la base)

## Toutes les routes

🔓 = publique. Toutes les autres routes demandent la session admin (`401` sinon).

| Ressource | Routes |
| --------- | ------ |
| API | 🔓 `GET /api` |
| Auth | 🔓 `GET /api/auth/check-session`, 🔓 `POST /api/auth/login`, 🔓 `POST /api/auth/verify-otp`, 🔓 `POST /api/auth/logout`, 🔓 `POST /api/auth/send-temp-password`, `POST /api/auth/update-password` |
| Clients | `GET /api/clients`, `POST /api/clients`, `PUT /api/clients/{id}`, `DELETE /api/clients/{id}` |
| Missions | `GET /api/missions`, `POST /api/missions`, `PUT /api/missions/{id}`, `DELETE /api/missions/{id}` |
| Services | `GET /api/services` |
| Taux d'intérêt | `GET /api/interest-rates`, `POST /api/interest-rates`, `PUT /api/interest-rates/{id}`, `DELETE /api/interest-rates/{id}` |
| Projets | 🔓 `GET /api/projects`, `POST /api/projects` (multipart), `PUT /api/projects/{id}`, `POST /api/projects/{id}/image`, `DELETE /api/projects/{id}` |
| Calendrier | 🔓 `GET /api/calendar`, `PUT` / `PATCH /api/calendar/{id}`, `POST /api/calendar/send-agenda` |
| Indisponibilités | 🔓 `GET /api/unavailability`, `POST /api/unavailability`, `PUT /api/unavailability/{id}`, `DELETE /api/unavailability/{id}` |
| Disponibilité | 🔓 `GET /api/availability`, `PUT /api/availability/toggle` |
| Banque | `GET /api/bank` |
| Environnement | `GET /api/env`, `PUT /api/env` |
| Base de données | 🔓 `GET /api/database/setup` (état seulement), `GET /api/database/download-db`, `GET /api/database/export-sql`, `POST /api/database/replace-db` |
| Stripe | 🔓 `POST /api/stripe/create-checkout`, 🔓 `POST /api/stripe/create-subscription`, 🔓 `GET /api/stripe/check-payment`, 🔓 `GET /api/stripe/check-subscription`, 🔓 `GET /api/stripe/payment-result`, 🔓 `GET /api/stripe/subscription-result` |
| Fichiers envoyés | 🔓 `GET /api/upload/images/{file}` |
