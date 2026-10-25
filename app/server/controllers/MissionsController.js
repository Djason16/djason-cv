// Missions of the clients: GET / POST /api/missions, PUT / DELETE /api/missions/{id}

// Same rules for create and update; returns the error message, or null when the body is valid
const invalid = body => {
    if (!body.clientId) return 'Client ID is required'
    if (!body.serviceId && !body.title) return 'Service ID or mission title is required'
    if (!body.date) return 'Mission date is required'
    return null
}

// Column values in the order of the INSERT / UPDATE below (month_concerned = YYYY-MM of the date)
const values = body => [
    body.clientId,
    body.serviceId || null,
    body.title || null,
    body.date,
    String(body.date).slice(0, 7),
    body.duration || 0,
    body.quantity || 1,
    body.unitPrice || null,
    body.tjm ?? null,
    body.tvaApplicable ? 1 : 0,
]

export default class MissionsController extends Controller {
    async getAll(event) {
        const missions = await this.fetchAll(`
            SELECT m.id, m.client_id, c.firstname, c.lastname, c.company_name, m.title, m.service_id, m.date, m.month_concerned,
                   m.duration, m.quantity, m.unit_price, m.tjm, m.vat_applicable
            FROM dc_missions m
            LEFT JOIN dc_clients c ON m.client_id = c.id
            ORDER BY m.date DESC`)
        return ResponseHelper.success(event, { missions })
    }

    async create(event) {
        const body = await this.body(event)
        const error = invalid(body)
        if (error) return ResponseHelper.validationError(event, error)

        const id = DatabaseHelper.uuid()
        await this.insert(
            `INSERT INTO dc_missions (id, client_id, service_id, title, date, month_concerned, duration, quantity, unit_price, tjm, vat_applicable)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, ...values(body)]
        )
        return ResponseHelper.success(event, { id }, 201)
    }

    async update(event, args) {
        const body = await this.body(event)
        const error = invalid(body)
        if (error) return ResponseHelper.validationError(event, error)

        const changed = await this.execute(
            `UPDATE dc_missions SET client_id = ?, service_id = ?, title = ?, date = ?, month_concerned = ?, duration = ?,
             quantity = ?, unit_price = ?, tjm = ?, vat_applicable = ? WHERE id = ?`,
            [...values(body), args.id]
        )
        return changed ? ResponseHelper.success(event, { id: args.id }) : ResponseHelper.notFound(event, 'Mission not found')
    }

    async delete(event, args) {
        const changed = await this.execute('DELETE FROM dc_missions WHERE id = ?', [args.id])
        return changed ? ResponseHelper.success(event, { id: args.id }) : ResponseHelper.notFound(event, 'Mission not found')
    }
}
