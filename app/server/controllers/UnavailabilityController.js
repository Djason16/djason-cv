// Unavailability periods (holidays...): GET (public) / POST /api/unavailability, PUT / DELETE /api/unavailability/{id}
const toPeriod = ({ id, start_date, end_date, created_at, updated_at }) =>
    ({ id, startDate: start_date, endDate: end_date, createdAt: created_at, updatedAt: updated_at })

export default class UnavailabilityController extends Controller {
    static publicActions = ['getAll']

    async getAll(event) {
        const rows = await this.fetchAll('SELECT * FROM dc_unavailability ORDER BY start_date DESC')
        return ResponseHelper.success(event, { periods: rows.map(toPeriod) })
    }

    async create(event) {
        const { startDate, endDate } = await this.body(event)
        if (!startDate || !endDate) return ResponseHelper.validationError(event, 'Start date and end date are required')

        const id = DatabaseHelper.uuid()
        await this.insert('INSERT INTO dc_unavailability (id, start_date, end_date) VALUES (?, ?, ?)', [id, startDate, endDate])
        return ResponseHelper.success(event, { id, message: 'Unavailability period created' }, 201)
    }

    async update(event, args) {
        const { startDate, endDate } = await this.body(event)
        if (!startDate || !endDate) return ResponseHelper.validationError(event, 'Start date and end date are required')

        const changed = await this.execute('UPDATE dc_unavailability SET start_date = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [startDate, endDate, args.id])
        return changed
            ? ResponseHelper.success(event, { id: args.id, message: 'Unavailability period updated' })
            : ResponseHelper.notFound(event, 'Unavailability period not found')
    }

    async delete(event, args) {
        const changed = await this.execute('DELETE FROM dc_unavailability WHERE id = ?', [args.id])
        return changed
            ? ResponseHelper.success(event, { id: args.id, message: 'Unavailability period deleted' })
            : ResponseHelper.notFound(event, 'Unavailability period not found')
    }
}
