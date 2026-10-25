// Session checked once when the site opens in the browser (useAuth().isAuthenticated)
export default defineNuxtPlugin(async () => {
    try {
        await useAuth().checkAuth()
    } catch (err) {
        console.error('Auth check failed on app load:', err)
    }
})