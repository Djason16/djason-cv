import type { RouteArgs } from '../utils/RouteDiscovery'
import type { H3Event } from 'h3'
/*
 * Missions of any client (time spent: rate × duration × quantity, or a fixed price; a title, an optional description),
 * put together on an invoice when picked:
 *   GET / POST /api/missions, PUT / DELETE /api/missions/{id}
 * A mission billed carries its invoice (invoice_id, set when the invoice is finalized, cleared when it is cancelled).
 */

// Same rules for create and update; returns the error message, or null when the body is valid
const invalid = (body: Record<string, any>) => {
    if (!body.clientId) return 'Client ID is required'
    if (!body.title) return 'Mission title is required'
    if (!body.date) return 'Mission date is required'
    return null
}

// Column values in the order of the INSERT / UPDATE below (month_concerned = YYYY-MM of the date)
const values = (body: Record<string, any>) => [
    body.clientId,
    body.serviceId || null,
    body.title || null,
    String(body.description || '').trim() || null,
    body.date,
    String(body.date).slice(0, 7),
    body.duration || 0,
    body.quantity || 1,
    body.unitPrice || null,
    body.tjm ?? null,
    body.tvaApplicable ? 1 : 0,
]

// Service of every mission: "Corporate Mission" (a mission keeps a service in the database)
const missionService = async () => (await DatabaseHelper.fetchOne("SELECT id FROM dc_services WHERE name = 'Corporate Mission'"))?.id
    || (await DatabaseHelper.fetchOne('SELECT id FROM dc_services LIMIT 1'))?.id

export default class MissionsController extends Controller {
    async getAll(event: H3Event) {
        const missions = await this.fetchAll(`
            SELECT m.id, m.client_id, c.firstname, c.lastname, c.company_name, m.title, m.description, m.service_id, m.date, m.month_concerned,
                   m.duration, m.quantity, m.unit_price, m.tjm, m.vat_applicable, m.invoice_id, d.number AS invoice_number
            FROM dc_missions m
            LEFT JOIN dc_clients c ON m.client_id = c.id
            LEFT JOIN dc_documents d ON d.id = m.invoice_id
            ORDER BY m.date DESC`)
        return ResponseHelper.success(event, { missions })
    }

    async create(event: H3Event) {
        const body = { ...(await this.body(event)) }
        const error = invalid(body)
        if (error) return ResponseHelper.validationError(event, error)
        body.serviceId ||= await missionService()

        const id = DatabaseHelper.newId()
        await this.insert(
            `INSERT INTO dc_missions (id, client_id, service_id, title, description, date, month_concerned, duration, quantity, unit_price, tjm, vat_applicable)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, ...values(body)]
        )
        return ResponseHelper.success(event, { id }, 201)
    }

    async update(event: H3Event, args: RouteArgs) {
        const body = { ...(await this.body(event)) }
        const error = invalid(body)
        if (error) return ResponseHelper.validationError(event, error)
        body.serviceId ||= await missionService()

        const changed = await this.execute(
            `UPDATE dc_missions SET client_id = ?, service_id = ?, title = ?, description = ?, date = ?, month_concerned = ?, duration = ?,
             quantity = ?, unit_price = ?, tjm = ?, vat_applicable = ? WHERE id = ?`,
            [...values(body), args.id]
        )
        return this.changed(event, changed, args.id, 'Mission not found')
    }

    async delete(event: H3Event, args: RouteArgs) {
        const changed = await this.execute('DELETE FROM dc_missions WHERE id = ?', [args.id])
        return this.changed(event, changed, args.id, 'Mission not found')
    }
}
