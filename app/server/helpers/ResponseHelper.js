/**
 * Every JSON response of the API goes through this object (DC Scaffold convention: https://github.com/Djason16/dc-scaffold).
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 *
 * Error messages are translation keys when the front displays them (e.g. 'invalidCredentials').
 */
export const ResponseHelper = {
    respond(event, data, statusCode = 200) {
        setResponseStatus(event, statusCode)
        return data
    },

    success(event, data = {}, statusCode = 200) {
        return ResponseHelper.respond(event, { success: true, ...data }, statusCode)
    },

    error(event, message, statusCode = 400, type = 'ERROR', extra = {}) {
        return ResponseHelper.respond(event, { success: false, error: message, type, ...extra }, statusCode)
    },

    validationError: (event, message) => ResponseHelper.error(event, message, 400, 'VALIDATION_ERROR'),
    authError: (event, message = 'Not authenticated') => ResponseHelper.error(event, message, 401, 'AUTH_ERROR'),
    forbidden: (event, message = 'Access denied') => ResponseHelper.error(event, message, 403, 'FORBIDDEN'),
    notFound: (event, message = 'Resource not found') => ResponseHelper.error(event, message, 404, 'NOT_FOUND'),
    tooManyRequests: (event, message = 'tooManyAttempts', retryAfter = 0) => {
        if (retryAfter) setResponseHeader(event, 'Retry-After', String(retryAfter))
        return ResponseHelper.error(event, message, 429, 'TOO_MANY_REQUESTS', retryAfter ? { retryAfter } : {})
    },
    serverError: (event, message = 'Internal server error') => ResponseHelper.error(event, message, 500, 'SERVER_ERROR'),

    /**
     * Turns any thrown error into the shared format (same rules as error.ts of DC Scaffold):
     * HTTP errors thrown on purpose (createError) keep their status and message, everything else
     * (a library error such as Stripe's, which can carry a statusCode and internal details) is a 500
     * whose real message is only shown in development.
     */
    fromError(event, error) {
        const statusCode = error?.statusCode || 500
        if (isError(error) && statusCode < 500) return ResponseHelper.error(event, error.statusMessage || error.message, statusCode, 'HTTP_ERROR')

        console.error('[API]', error)
        return ResponseHelper.serverError(event, import.meta.dev ? error?.message : 'Internal server error')
    },
}
