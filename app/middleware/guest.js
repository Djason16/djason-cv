import { withTrailingSlash } from '@/utils/pathHelpers.js'

// Login page: straight to /admin/ when already logged in
export default defineNuxtRouteMiddleware(async () => {
    if (!process.client) return

    const { isAuthenticated, checkAuth } = useAuth()
    if (!isAuthenticated.value) await checkAuth()
    if (isAuthenticated.value) {
        const redirect = withTrailingSlash('/admin')
        if (window.location.pathname !== redirect) window.location.replace(redirect)
    }
})
