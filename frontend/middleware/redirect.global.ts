// Every page address ends with a slash (/legal/), like the static site and the sitemap
export default defineNuxtRouteMiddleware(to => {
    // Skips if redirected, on server, or API route
    if (to.redirectedFrom || process.server || to.path.startsWith('/api/')) return

    // Checks if path points to a file
    const isFile = /\.[a-zA-Z0-9]+$/.test(to.path)

    // Redirects non-file paths missing trailing slash
    if (!isFile && !to.path.endsWith('/') && to.path !== '/') {
        return navigateTo(to.path + '/', { redirectCode: 301 })
    }
})