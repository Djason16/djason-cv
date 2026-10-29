/*
 * Editor of the .env file of the current mode (admin only, see server/helpers/EnvHelper.js):
 *   GET /api/env   every KEY=value
 *   PUT /api/env   { KEY: value, ... } updated or added
 */
export default class EnvController extends Controller {
    static routes = { save: ['PUT', ''] }

    async getAll(event) {
        try {
            return ResponseHelper.success(event, { env: await EnvHelper.read() })
        } catch {
            return ResponseHelper.serverError(event, 'Failed to read env file')
        }
    }

    // PUT /api/env: updates or adds the given keys
    async save(event) {
        const updates = await this.body(event)
        if (!Object.keys(updates).length) return ResponseHelper.validationError(event, 'Invalid request body')

        const invalid = EnvHelper.invalidKeys(updates)
        if (invalid.length) return ResponseHelper.validationError(event, `Invalid keys: ${invalid.join(', ')}`)

        // Written after the response: in development the file change restarts the server
        setImmediate(() => EnvHelper.write(updates).catch(error => console.error('Failed to update env file:', error)))
        return ResponseHelper.success(event, { message: 'Environment variables updated successfully' })
    }
}
