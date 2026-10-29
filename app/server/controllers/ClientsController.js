// Clients of the admin: GET / POST /api/clients, PUT / DELETE /api/clients/{id}
// Columns sent to the admin
const COLUMNS = 'id, firstname, lastname, company_name, email, phone, address, postal_code, city, type, siret, active'

// Optional fields are stored as NULL when empty
const values = body => [
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
    async getAll(event) {
        const clients = await this.fetchAll(`SELECT ${COLUMNS} FROM dc_clients ORDER BY created_at DESC NULLS LAST, company_name ASC`)
        return ResponseHelper.success(event, { clients })
    }

    async create(event) {
        const body = await this.body(event)
        const missing = RequestHelper.missing(body, ['email', 'type'])
        if (missing.length) return ResponseHelper.validationError(event, `Missing fields: ${missing.join(', ')}`)

        const id = DatabaseHelper.uuid()
        await this.insert(
            `INSERT INTO dc_clients (id, firstname, lastname, company_name, email, phone, address, postal_code, city, siret, type, active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, ...values(body)]
        )
        return ResponseHelper.success(event, { id }, 201)
    }

    async update(event, args) {
        const body = await this.body(event)
        const changed = await this.execute(
            `UPDATE dc_clients SET firstname = ?, lastname = ?, company_name = ?, email = ?, phone = ?, address = ?,
             postal_code = ?, city = ?, siret = ?, type = ?, active = ? WHERE id = ?`,
            [...values(body), args.id]
        )
        return changed ? ResponseHelper.success(event, { id: args.id }) : ResponseHelper.notFound(event, 'Client not found')
    }

    async delete(event, args) {
        const changed = await this.execute('DELETE FROM dc_clients WHERE id = ?', [args.id])
        return changed ? ResponseHelper.success(event, { id: args.id }) : ResponseHelper.notFound(event, 'Client not found')
    }
}
