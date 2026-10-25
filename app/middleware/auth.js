import { withTrailingSlash } from '@/utils/pathHelpers.js'

// Admin page: back to /login/ without a session (comfort only, the API checks the session itself)
export default defineNuxtRouteMiddleware(async () => {
    if (!process.client) return

    const { isAuthenticated, checkAuth } = useAuth()
    if (!isAuthenticated.value) await checkAuth()
    if (!isAuthenticated.value) {
        const redirect = withTrailingSlash('/login')
        if (window.location.pathname !== redirect) window.location.replace(redirect)
    }
})
