export const TRAILING_SLASH_ENABLED = true;

// Append trailing slash if enabled and missing
export const withTrailingSlash = (path, enabled = TRAILING_SLASH_ENABLED) =>
    enabled && !path.endsWith('/') ? path + '/' : path;
