import { withTrailingSlash } from '@/utils/pathHelpers'

export const AUTH_CONFIG = { REDIRECT_DELAY: 800 }

// Helper for delayed client-side navigation
const delayedRedirect = async path => {
    await new Promise(r => setTimeout(r, AUTH_CONFIG.REDIRECT_DELAY))
    if (process.client) window.location.href = withTrailingSlash(path)
}

export const useAuth = () => {
    const isAuthenticated = useState('isAuthenticated', () => false)
    const loading = useState('authLoading', () => false)

    // Check current session
    const checkAuth = async () => {
        try {
            const { authenticated } = await $fetch('/api/auth/check-session')
            isAuthenticated.value = authenticated
            return authenticated
        } catch {
            isAuthenticated.value = false
            return false
        }
    }

    // Login with validation
    const login = async (email, password) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return { success: false, error: 'invalidEmail' }
        if (!password)
            return { success: false, error: 'passwordRequired' }

        loading.value = true
        try {
            await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
            await delayedRedirect('/admin')
            await checkAuth()
            loading.value = false
            return { success: true, message: 'loginSuccess' }
        } catch (err) {
            loading.value = false
            return { success: false, error: err.data?.message || 'invalidCredentials' }
        }
    }

    // Logout and redirect
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

    // Update user password
    const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
        if (!currentPassword || !newPassword || !confirmPassword)
            return { success: false, error: 'allFieldsRequired' }
        if (newPassword !== confirmPassword)
            return { success: false, error: 'passwordsDoNotMatch' }
        if (newPassword.length < 8)
            return { success: false, error: 'passwordTooShort' }

        loading.value = true
        try {
            const res = await $fetch('/api/auth/update-password', { method: 'POST', body: { oldPassword: currentPassword, newPassword } })
            loading.value = false
            return res.success
                ? { success: true, message: 'passwordUpdated' }
                : { success: false, error: res.message || 'passwordUpdateError' }
        } catch (err) {
            loading.value = false
            return { success: false, error: err.data?.message || 'passwordUpdateError' }
        }
    }

    return { isAuthenticated, loading, checkAuth, login, logout, updatePassword }
}