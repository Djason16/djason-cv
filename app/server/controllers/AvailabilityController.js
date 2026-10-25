/*
 * Manual availability status (one row in dc_availability_override), shown instead of the schedule when enabled:
 *   GET /api/availability          public
 *   PUT /api/availability/toggle   { enabled, status: 'available' | 'busy' | 'unavailable' }
 */
const STATUSES = ['available', 'busy', 'unavailable']

export default class AvailabilityController extends Controller {
    static publicActions = ['getAll']

    static routes = { toggle: ['PUT', '/toggle'] }

    async getAll(event) {
        const row = await this.fetchOne('SELECT * FROM dc_availability_override LIMIT 1')
        const override = row
            ? { id: row.id, enabled: Boolean(row.enabled), status: row.status, updatedAt: row.updated_at }
            : { id: null, enabled: false, status: null, updatedAt: null }
        return ResponseHelper.success(event, { override })
    }

    async toggle(event) {
        const { enabled, status } = await this.body(event)
        if (enabled && !STATUSES.includes(status))
            return ResponseHelper.validationError(event, 'Status must be available, busy, or unavailable')

        const row = await this.fetchOne('SELECT * FROM dc_availability_override LIMIT 1')
        const finalStatus = STATUSES.includes(status) ? status : (row?.status || 'unavailable')
        const id = row?.id || DatabaseHelper.uuid()

        if (row)
            await this.execute('UPDATE dc_availability_override SET enabled = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [Boolean(enabled), finalStatus, id])
        else
            await this.insert('INSERT INTO dc_availability_override (id, enabled, status) VALUES (?, ?, ?)', [id, Boolean(enabled), finalStatus])

        return ResponseHelper.success(event, {
            override: { id, enabled: Boolean(enabled), status: finalStatus },
            message: enabled ? 'Availability override activated' : 'Availability override deactivated',
        })
    }
}
