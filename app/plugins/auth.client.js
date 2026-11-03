// Session checked once when the site opens in the browser, without blocking the page (useAuth().isAuthenticated)
export default defineNuxtPlugin(() => {
    useAuth().checkAuth()
})
