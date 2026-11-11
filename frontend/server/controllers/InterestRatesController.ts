import type { RouteArgs } from '../utils/RouteDiscovery'
import type { H3Event } from 'h3'
import { todayIso } from '~/utils/display'
// Late payment interest rates: GET / POST /api/interest-rates, PUT / DELETE /api/interest-rates/{id}
// A rate applies to professional or individual clients
const TYPES = ['professional', 'individual']

export default class InterestRatesController extends Controller {
    // Rates valid today first, then by type and most recent
    async getAll(event: H3Event) {
        const today = todayIso()
        const rates = await this.fetchAll(`
            SELECT id, rate, type, valid_from, valid_until, created_at
            FROM dc_interest_rates
            ORDER BY CASE WHEN valid_from <= ? AND valid_until >= ? THEN 0 ELSE 1 END, type ASC, valid_from DESC`,
            [today, today])
        return ResponseHelper.success(event, { rates })
    }

    async create(event: H3Event) {
        const body = await this.body(event)
        if (RequestHelper.missing(body, ['rate', 'valid_from', 'valid_until']).length)
            return ResponseHelper.validationError(event, 'Rate, valid_from, and valid_until are required')
        if (!TYPES.includes(body.type)) return ResponseHelper.validationError(event, 'Type must be professional or individual')

        const id = DatabaseHelper.newId()
        await this.insert('INSERT INTO dc_interest_rates (id, rate, type, valid_from, valid_until) VALUES (?, ?, ?, ?, ?)',
            [id, body.rate, body.type, body.valid_from, body.valid_until])
        return ResponseHelper.success(event, { id }, 201)
    }

    async update(event: H3Event, args: RouteArgs) {
        const body = await this.body(event)
        if (RequestHelper.missing(body, ['rate', 'valid_from', 'valid_until']).length)
            return ResponseHelper.validationError(event, 'Rate, valid_from, and valid_until are required')
        if (!TYPES.includes(body.type)) return ResponseHelper.validationError(event, 'Type must be professional or individual')

        const changed = await this.execute('UPDATE dc_interest_rates SET rate = ?, type = ?, valid_from = ?, valid_until = ? WHERE id = ?',
            [body.rate, body.type, body.valid_from, body.valid_until, args.id])
        return this.changed(event, changed, args.id, 'Interest rate not found')
    }

    async delete(event: H3Event, args: RouteArgs) {
        const changed = await this.execute('DELETE FROM dc_interest_rates WHERE id = ?', [args.id])
        return this.changed(event, changed, args.id, 'Interest rate not found')
    }
}
