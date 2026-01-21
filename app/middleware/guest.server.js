import { withTrailingSlash } from '@/utils/pathHelpers'

export default defineNuxtRouteMiddleware(async () => {
    if (!process.client) return

    const { isAuthenticated, checkAuth } = useAuth()
    if (!isAuthenticated.value) await checkAuth() // verify authentication
    if (isAuthenticated.value) {                  // redirect authenticated users
        const redirect = withTrailingSlash('/admin')
        if (window.location.pathname !== redirect) window.location.replace(redirect)
    }
})
