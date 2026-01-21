export default defineNuxtPlugin(async () => {
    try {
        await useAuth().checkAuth() // Check authentication on app load
    } catch (err) {
        console.error('Auth check failed on app load:', err)
    }
})