// Every page is built with trailing slashes (/legal/), the URLs below follow the same rule
export const TRAILING_SLASH_ENABLED = true

/**
 * Appends a trailing slash when enabled and missing: withTrailingSlash('/legal') -> '/legal/'
 * @param {string} path
 * @param {boolean} [enabled]
 * @returns {string}
 */
export const withTrailingSlash = (path, enabled = TRAILING_SLASH_ENABLED) =>
    enabled && !path.endsWith('/') ? `${path}/` : path
