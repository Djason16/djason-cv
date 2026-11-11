import type { RouteArgs } from '../utils/RouteDiscovery'
import type { H3Event } from 'h3'
// Clients of the admin: GET / POST /api/clients, PUT / DELETE /api/clients/{id}
// Columns sent to the admin
const COLUMNS = 'id, firstname, lastname, company_name, email, phone, address, postal_code, city, type, siret, active'

// Optional fields are stored as NULL when empty
const values = (body: Record<string, any>) => [
    body.firstname || null,
    body.lastname || null,
    body.company_name || null,
    body.email || null,
    body.phone || null,
    body.address || null,
    body.postal_code || null,
    body.city || null,
    body.siret || null,
    body.type || null,
    // Active unless explicitly turned off
    body.active === false || body.active === 0 || body.active === '0' ? 0 : 1,
]

export default class ClientsController extends Controller {
    async getAll(event: H3Event) {
        const clients = await this.fetchAll(`SELECT ${COLUMNS} FROM dc_clients ORDER BY created_at IS NULL, created_at DESC, company_name ASC`)
        return ResponseHelper.success(event, { clients })
    }

    async create(event: H3Event) {
        const body = await this.body(event)
        const missing = RequestHelper.missing(body, ['email', 'type'])
        if (missing.length) return ResponseHelper.validationError(event, `Missing fields: ${missing.join(', ')}`)

        const id = DatabaseHelper.newId()
        await this.insert(
            `INSERT INTO dc_clients (id, firstname, lastname, company_name, email, phone, address, postal_code, city, siret, type, active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, ...values(body)]
        )
        return ResponseHelper.success(event, { id }, 201)
    }

    async update(event: H3Event, args: RouteArgs) {
        const body = await this.body(event)
        const changed = await this.execute(
            `UPDATE dc_clients SET firstname = ?, lastname = ?, company_name = ?, email = ?, phone = ?, address = ?,
             postal_code = ?, city = ?, siret = ?, type = ?, active = ? WHERE id = ?`,
            [...values(body), args.id]
        )
        return this.changed(event, changed, args.id, 'Client not found')
    }

    async delete(event: H3Event, args: RouteArgs) {
        const changed = await this.execute('DELETE FROM dc_clients WHERE id = ?', [args.id])
        return this.changed(event, changed, args.id, 'Client not found')
    }
}
