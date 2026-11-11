// Security headers on every answer of the site and of the API, errors included (server/utils/SecurityHelper.js);
// the proxy of the host tells when it is HTTPS. This site adds stricter ones (recette T-028): never shown inside
// another site (DENY + frame-ancestors), camera, microphone and location never asked, HSTS for the subdomains too.
const STRICTER = {
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
}

export default defineEventHandler((event) => {
    const isHttps = getRequestProtocol(event, { xForwardedProto: true }) === 'https'
    setResponseHeaders(event, { ...SecurityHelper.headers(isHttps), ...STRICTER })
    if (isHttps) setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
})
