// Late payment interest rates: GET / POST /api/interest-rates, PUT / DELETE /api/interest-rates/{id}
// A rate applies to professional or individual clients
const TYPES = ['professional', 'individual']

export default class InterestRatesController extends Controller {
    // Rates valid today first, then by type and most recent
    async getAll(event) {
        const today = new Date().toISOString().split('T')[0]
        const rates = await this.fetchAll(`
            SELECT id, rate, type, valid_from, valid_until, created_at
            FROM dc_interest_rates
            ORDER BY CASE WHEN valid_from <= ? AND valid_until >= ? THEN 0 ELSE 1 END, type ASC, valid_from DESC`,
            [today, today])
        return ResponseHelper.success(event, { rates })
    }

    async create(event) {
        const body = await this.body(event)
        if (RequestHelper.missing(body, ['rate', 'valid_from', 'valid_until']).length)
            return ResponseHelper.validationError(event, 'Rate, valid_from, and valid_until are required')
        if (!TYPES.includes(body.type)) return ResponseHelper.validationError(event, 'Type must be professional or individual')

        const id = DatabaseHelper.uuid()
        await this.insert('INSERT INTO dc_interest_rates (id, rate, type, valid_from, valid_until) VALUES (?, ?, ?, ?, ?)',
            [id, body.rate, body.type, body.valid_from, body.valid_until])
        return ResponseHelper.success(event, { id }, 201)
    }

    async update(event, args) {
        const body = await this.body(event)
        if (RequestHelper.missing(body, ['rate', 'valid_from', 'valid_until']).length)
            return ResponseHelper.validationError(event, 'Rate, valid_from, and valid_until are required')
        if (!TYPES.includes(body.type)) return ResponseHelper.validationError(event, 'Type must be professional or individual')

        const changed = await this.execute('UPDATE dc_interest_rates SET rate = ?, type = ?, valid_from = ?, valid_until = ? WHERE id = ?',
            [body.rate, body.type, body.valid_from, body.valid_until, args.id])
        return changed ? ResponseHelper.success(event, { id: args.id }) : ResponseHelper.notFound(event, 'Interest rate not found')
    }

    async delete(event, args) {
        const changed = await this.execute('DELETE FROM dc_interest_rates WHERE id = ?', [args.id])
        return changed ? ResponseHelper.success(event, { id: args.id }) : ResponseHelper.notFound(event, 'Interest rate not found')
    }
}
