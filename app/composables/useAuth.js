import { withTrailingSlash } from '@/utils/pathHelpers'

// Auth config
export const AUTH_CONFIG = { REDIRECT_DELAY: 800 }

// Delay helper for client redirects
const delayedRedirect = async path => {
    await new Promise(r => setTimeout(r, AUTH_CONFIG.REDIRECT_DELAY))
    if (process.client) window.location.href = withTrailingSlash(path)
}

export const useAuth = () => {
    const isAuthenticated = useState('isAuthenticated', () => false)
    const loading = useState('authLoading', () => false)
    const error = useState('authError', () => null)

    // Check current session status
    const checkAuth = async () => {
        try {
            const { authenticated } = await $fetch('/api/auth/check-session')
            return (isAuthenticated.value = authenticated)
        } catch {
            return (isAuthenticated.value = false)
        }
    }

    // Handle login with validation, state updates, and redirect
    const login = async (email, password) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return { success: false, error: (error.value = { key: 'invalidEmail', type: 'error' }) }
        if (!password)
            return { success: false, error: (error.value = { key: 'passwordRequired', type: 'error' }) }

        loading.value = true
        error.value = null

        try {
            const res = await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
            await delayedRedirect('/admin')
            await checkAuth()
            loading.value = false
            return { success: true, message: { key: res.message || 'loginSuccess', type: 'success' } }
        } catch (err) {
            loading.value = false
            return { success: false, error: (error.value = { key: err.data?.message || 'invalidCredentials', type: 'error' }) }
        }
    }

    // Handle logout and reset state
    const logout = async () => {
        try {
            await $fetch('/api/auth/logout', { method: 'POST' })
            await delayedRedirect('/')
            isAuthenticated.value = false
            return true
        } catch (err) {
            console.error('Logout failed:', err)
            return false
        }
    }

    return { isAuthenticated, loading, error, checkAuth, login, logout }
}