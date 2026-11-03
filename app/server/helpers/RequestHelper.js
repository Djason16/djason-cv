/**
 * Reads incoming data the same way in every controller (DC Scaffold convention: https://github.com/Djason16/dc-scaffold).
 */
export const RequestHelper = {
    /** Request body as an object, whether the client sent JSON or form fields. */
    async body(event) {
        const body = await readBody(event).catch(() => null)
        return body && typeof body === 'object' ? body : {}
    },

    /** Query string value: /products?page=2 -> query(event, 'page') === '2' */
    query(event, key, fallback = null) {
        return getQuery(event)[key] ?? fallback
    },

    /** Names of the required fields that are missing or empty. */
    missing(data, requiredFields) {
        return requiredFields.filter(field => data[field] === undefined || data[field] === null || data[field] === '')
    },

    /**
     * Multipart form (file uploads): text fields as strings, files by field name.
     *   const { fields, files } = await RequestHelper.multipart(event)
     */
    async multipart(event) {
        const parts = (await readMultipartFormData(event).catch(() => null)) || []
        const fields = {}
        const files = {}

        for (const part of parts) {
            if (!part.name) continue
            if (part.filename) files[part.name] = part
            else fields[part.name] = part.data.toString('utf-8')
        }

        return { fields, files }
    },

    /** Client IP (first X-Forwarded-For entry behind Apache, socket address otherwise). */
    ip(event) {
        return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    },
}
