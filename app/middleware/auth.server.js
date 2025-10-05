import { withTrailingSlash } from '@/utils/pathHelpers'

export default defineNuxtRouteMiddleware(async () => {
    if (!process.client) return

    const { isAuthenticated, checkAuth } = useAuth()
    if (!isAuthenticated.value) await checkAuth()
    if (!isAuthenticated.value) {
        const redirect = withTrailingSlash('/login')
        if (window.location.pathname !== redirect) window.location.replace(redirect)
    }
})