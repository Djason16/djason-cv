export default defineNuxtRouteMiddleware(to => {
    // Skip if redirected, on server, or API route
    if (to.redirectedFrom || process.server || to.path.startsWith('/api/')) return

    // Check if path points to a file
    const isFile = /\.[a-zA-Z0-9]+$/.test(to.path)

    // Redirect non-file paths missing trailing slash
    if (!isFile && !to.path.endsWith('/') && to.path !== '/') {
        return navigateTo(to.path + '/', { redirectCode: 301 })
    }
})