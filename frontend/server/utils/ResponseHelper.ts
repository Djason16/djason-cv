// dc-scaffold: adapted (messages as translation keys: tooManyAttempts..., fromError, changed)
import type { H3Event } from 'h3'

/**
 * Every JSON response of the API goes through this object.
 *
 * Success: { "success": true, ...data }
 * Error:   { "success": false, "error": "message", "type": "VALIDATION_ERROR" }
 *
 * Error messages are translation keys when the front displays them (e.g. 'invalidCredentials').
 */
export const ResponseHelper = {
    respond(event: H3Event, data: Record<string, unknown>, statusCode = 200) {
        setResponseStatus(event, statusCode)
        return data
    },

    success(event: H3Event, data: Record<string, unknown> = {}, statusCode = 200) {
        return ResponseHelper.respond(event, { success: true, ...data }, statusCode)
    },

    error(event: H3Event, message: string, statusCode = 400, type = 'ERROR', extra: Record<string, unknown> = {}) {
        return ResponseHelper.respond(event, { success: false, error: message, type, ...extra }, statusCode)
    },

    validationError: (event: H3Event, message: string) => ResponseHelper.error(event, message, 400, 'VALIDATION_ERROR'),
    authError: (event: H3Event, message = 'Not authenticated') => ResponseHelper.error(event, message, 401, 'AUTH_ERROR'),
    forbidden: (event: H3Event, message = 'Access denied') => ResponseHelper.error(event, message, 403, 'FORBIDDEN'),
    notFound: (event: H3Event, message = 'Resource not found') => ResponseHelper.error(event, message, 404, 'NOT_FOUND'),
    serverError: (event: H3Event, message = 'Internal server error') => ResponseHelper.error(event, message, 500, 'SERVER_ERROR'),
    // Limit of tries reached (429): "Retry-After" tells the browser when to try again (in seconds)
    tooManyRequests: (event: H3Event, message = 'tooManyAttempts', retryAfter = 0) => {
        if (retryAfter) setResponseHeader(event, 'Retry-After', retryAfter)
        return ResponseHelper.error(event, message, 429, 'TOO_MANY_REQUESTS', retryAfter ? { retryAfter } : {})
    },

    /**
     * Any thrown error in the shared format: HTTP errors thrown on purpose (createError) keep their status and message,
     * everything else (a library error such as Stripe's, which can carry a statusCode and internal details) is a 500
     * whose real message is only shown in development.
     */
    fromError(event: H3Event, error: any) {
        const statusCode = error?.statusCode || 500
        if (isError(error) && statusCode < 500) return ResponseHelper.error(event, error.statusMessage || error.message, statusCode, 'HTTP_ERROR')

        console.error('[API]', error)
        return ResponseHelper.serverError(event, import.meta.dev ? error?.message : 'Internal server error')
    },
}
