export default defineNuxtRouteMiddleware(to => {
    // Skip if redirected or on server
    if (to.redirectedFrom || process.server) return

    // Check if path points to a file
    const isFile = /\.[a-zA-Z0-9]+$/.test(to.path)

    // Redirect non-file paths missing trailing slash
    if (!isFile && !to.path.endsWith('/') && to.path !== '/') {
        return navigateTo(to.path + '/', { redirectCode: 301 })
    }
})