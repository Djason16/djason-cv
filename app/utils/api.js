/**
 * Client for the project API (DC Scaffold convention: https://github.com/Djason16/dc-scaffold), server routes in server/controllers/.
 * Nuxt and Nitro run in the same project: the API is /api on the same site, so the session cookie
 * is sent automatically and the calls also work during server-side rendering ($fetch).
 *
 *   await api.get('/clients')
 *   await api.post('/clients', { email: 'a@b.c' })     // JSON body
 *   await api.post('/projects', formData)              // FormData sent as-is
 *   await api.put('/clients/1', data)
 *   await api.patch('/calendar/1', data)
 *   await api.delete('/clients/1')
 *   await api.download('/database/export-sql', 'backup.sql')
 *
 * Every call resolves (never throws) to:
 *   success -> the JSON returned by the API, e.g. { success: true, clients: [...] }
 *   failure -> { success: false, error: 'message', status: 404, ...API fields }
 * The error is a translation key when the API sends one (e.g. 'invalidCredentials').
 */

/**
 * @typedef {{ success: boolean, error?: string, status?: number, [key: string]: any }} ApiResult
 * @typedef {Record<string, string>} RequestHeaders
 */

const BASE_URL = '/api'

// '/clients' -> '/api/clients'
/** @param {string} endpoint */
const buildUrl = endpoint => `${BASE_URL}${endpoint}`

// Debug logs in development only
/** @param {...any} args */
const log = (...args) => import.meta.dev && console.log('[API]', ...args)

/**
 * @param {string} error
 * @param {number} [status]
 * @param {object} [data]
 * @returns {ApiResult}
 */
const failure = (error, status = 0, data = {}) => ({ ...data, success: false, error, status })

// OK + JSON -> data, otherwise a failure
/**
 * @param {boolean} ok
 * @param {number} status
 * @param {any} data
 * @returns {ApiResult}
 */
const toResult = (ok, status, data) => {
    if (!data || typeof data !== 'object') return failure(`Invalid response (HTTP ${status})`, status)
    return ok ? data : failure(data.error || `HTTP ${status}`, status, data)
}

// Turns network errors (server down...) into a failure instead of an exception
/**
 * @param {string} label
 * @param {() => Promise<ApiResult>} request
 * @returns {Promise<ApiResult>}
 */
const safely = async (label, request) => {
    try {
        return await request()
    } catch (err) {
        console.error('[API]', label, err)
        return failure((err instanceof Error && err.message) || 'Unable to contact the server.')
    }
}

// Single place where requests are sent: every shortcut below calls it.
// JSON bodies are serialized by $fetch, FormData is sent untouched (the browser sets its boundary)
/**
 * @param {string} endpoint
 * @param {string} [method]
 * @param {any} [body]
 * @param {RequestHeaders} [headers]
 * @returns {Promise<ApiResult>}
 */
export const apiRequest = (endpoint, method = 'GET', body = null, headers = {}) =>
    safely(`${method} ${endpoint}`, async () => {
        log(method, endpoint, body instanceof FormData ? '[FormData]' : body ?? '')
        const res = await $fetch.raw(buildUrl(endpoint), {
            method,
            headers,
            body: body ?? undefined,
            credentials: 'include',
            ignoreResponseError: true,
        })
        return toResult(res.ok, res.status, res._data)
    })

// Downloads a file (SQL dump, database...) and opens the browser "save" dialog
/**
 * @param {string} endpoint
 * @param {string} filename
 * @returns {Promise<ApiResult>}
 */
const download = (endpoint, filename) =>
    safely(`DOWNLOAD ${endpoint}`, async () => {
        log('DOWNLOAD', endpoint, filename)
        const res = await $fetch.raw(buildUrl(endpoint), { responseType: 'blob', credentials: 'include', ignoreResponseError: true })
        if (!res.ok) {
            const data = await res._data?.text?.().then(text => JSON.parse(text)).catch(() => null)
            return toResult(false, res.status, data)
        }

        const link = document.createElement('a')
        link.href = URL.createObjectURL(res._data)
        link.download = filename
        document.body.appendChild(link)
        link.click()
        link.remove()
        URL.revokeObjectURL(link.href)

        return { success: true }
    })

export const api = {
    /** @type {(endpoint: string, headers?: RequestHeaders) => Promise<ApiResult>} */
    get: (endpoint, headers) => apiRequest(endpoint, 'GET', null, headers),
    /** @type {(endpoint: string, body?: any, headers?: RequestHeaders) => Promise<ApiResult>} */
    post: (endpoint, body, headers) => apiRequest(endpoint, 'POST', body, headers),
    /** @type {(endpoint: string, body?: any, headers?: RequestHeaders) => Promise<ApiResult>} */
    put: (endpoint, body, headers) => apiRequest(endpoint, 'PUT', body, headers),
    /** @type {(endpoint: string, body?: any, headers?: RequestHeaders) => Promise<ApiResult>} */
    patch: (endpoint, body, headers) => apiRequest(endpoint, 'PATCH', body, headers),
    /** @type {(endpoint: string, headers?: RequestHeaders) => Promise<ApiResult>} */
    delete: (endpoint, headers) => apiRequest(endpoint, 'DELETE', null, headers),
    download,
}
