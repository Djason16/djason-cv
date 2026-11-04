/**
 * Security headers on every answer of the site and of the API (recette T-028).
 *   - the site can't be shown inside another site (clickjacking): X-Frame-Options + frame-ancestors
 *   - the browser never guesses a file type (X-Content-Type-Options)
 *   - other sites only see the domain of the page a visitor comes from (Referrer-Policy)
 *   - camera, microphone and location are never asked (Permissions-Policy)
 *   - HTTPS only for a year once a visitor came in HTTPS (Strict-Transport-Security, never on http://localhost)
 * The "x-powered-by: Nuxt" header is removed: it only tells attackers what the site runs on.
 */
const HEADERS = {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
}

export default defineNitroPlugin(nitroApp => {
    nitroApp.hooks.hook('request', event => {
        setResponseHeaders(event, HEADERS)
        if (getRequestProtocol(event, { xForwardedProto: true }) === 'https')
            setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    })
    nitroApp.hooks.hook('beforeResponse', event => removeResponseHeader(event, 'x-powered-by'))
    nitroApp.hooks.hook('render:response', response => {
        if (response?.headers) delete response.headers['x-powered-by']
    })
})
