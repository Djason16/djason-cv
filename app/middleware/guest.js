import { withTrailingSlash } from '@/utils/pathHelpers.js'

// Login page: straight to /admin/ when already logged in
export default defineNuxtRouteMiddleware(async () => {
    if (!process.client) return

    // Same request as the one started by plugins/auth.client.js
    const { isAuthenticated, checkAuth } = useAuth()
    await checkAuth()
    if (isAuthenticated.value) {
        const redirect = withTrailingSlash('/admin')
        if (window.location.pathname !== redirect) window.location.replace(redirect)
    }
})
