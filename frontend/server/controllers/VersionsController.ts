import type { H3Event } from 'h3'
/*
 * Versions of the data (dc_versions, +1 at every write: server/utils/DatabaseHelper.js), asked often by the browser
 * (utils/liveData.js), which then loads again only the lists that changed:
 *   GET /api/versions   { versions: { dc_skills: 4, dc_projects: 9, ... } }
 * Public: a visitor gets the tables of the public pages, the admin every table.
 */
const PUBLIC_TABLES = ['dc_projects', 'dc_skills', 'dc_settings', 'dc_texts', 'dc_unavailability', 'dc_availability_override', 'dc_calendar_settings']

export default class VersionsController extends Controller {
    static publicActions = ['getAll']

    async getAll(event: H3Event) {
        const admin = Boolean(await SessionHelper.userId(event))
        const rows = await this.fetchAll('SELECT name, version FROM dc_versions')
        const versions = Object.fromEntries(rows.filter(row => admin || PUBLIC_TABLES.includes(row.name)).map(row => [row.name, Number(row.version)]))
        // Always asked again: never a copy kept by the browser or a proxy
        setResponseHeader(event, 'Cache-Control', 'no-store')
        return ResponseHelper.success(event, { versions })
    }
}
