import { api } from '@/utils/api.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'

/*
 * Admin session: login in two steps (password, then the code received by email), logout, password change.
 *   const { isAuthenticated, login, verifyOtp, logout } = useAuth()
 */

// Pause before the redirect after a login or logout, so the message can be read (milliseconds)
const AUTH_CONFIG = { REDIRECT_DELAY: 800 }

// Goes to the page after the pause
const delayedRedirect = async path => {
    await new Promise(r => setTimeout(r, AUTH_CONFIG.REDIRECT_DELAY))
    if (process.client) window.location.href = withTrailingSlash(path)
}

export const useAuth = () => {
    const isAuthenticated = useState('isAuthenticated', () => false)
    const loading = useState('authLoading', () => false)

    // Checks current session validity against the server
    const checkAuth = async () => {
        const res = await api.get('/auth/check-session')
        isAuthenticated.value = Boolean(res.success && res.authenticated)
        return isAuthenticated.value
    }

    // Pending OTP state — stores userId between login and OTP verification
    const otpPending = useState('otpPending', () => ({ active: false, userId: null }))

    // Validates credentials and triggers OTP flow if correct
    const login = async (email, password) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return { success: false, error: 'invalidEmail' }
        if (!password)
            return { success: false, error: 'passwordRequired' }

        loading.value = true
        const res = await api.post('/auth/login', { email, password })
        loading.value = false
        if (!res.success) return { success: false, error: res.error || 'invalidCredentials' }

        // Credentials valid — OTP sent, wait for verification
        if (res.otpRequired) {
            otpPending.value = { active: true, userId: res.userId }
            return { success: true, otpRequired: true, message: 'otpSent' }
        }

        return { success: true, message: res.message }
    }

    // Verifies OTP code and creates session on success
    const verifyOtp = async (code) => {
        if (!code) return { success: false, error: 'missingOtp' }

        loading.value = true
        const res = await api.post('/auth/verify-otp', { userId: otpPending.value.userId, code })
        if (!res.success) {
            loading.value = false
            return { success: false, error: res.error || 'invalidOtp' }
        }

        otpPending.value = { active: false, userId: null }
        await checkAuth()
        await delayedRedirect('/admin')
        loading.value = false
        return { success: true, message: 'loginSuccess' }
    }

    // Resets OTP state without redirecting
    const cancelOtp = () => {
        otpPending.value = { active: false, userId: null }
    }

    // Logout, invalidate session and redirect to home
    const logout = async () => {
        const res = await api.post('/auth/logout')
        if (!res.success) return false

        await delayedRedirect('/')
        isAuthenticated.value = false
        return true
    }

    // Sends temporary password after security answer verification
    const forgotPassword = async (email, securityAnswer, locale) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return { success: false, error: 'invalidEmail' }
        if (!securityAnswer)
            return { success: false, error: 'enterSecurityAnswer' }

        loading.value = true
        const res = await api.post('/auth/send-temp-password', { email, securityAnswer, locale, message: '' })
        loading.value = false
        return res.success
            ? { success: true, message: res.message }
            : { success: false, error: res.error || (res.status === 401 ? 'incorrectSecurityAnswer' : 'errorSendingTempPassword') }
    }

    // Updates password after verifying the current one
    const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
        if (!currentPassword || !newPassword || !confirmPassword)
            return { success: false, error: 'allFieldsRequired' }
        if (newPassword !== confirmPassword)
            return { success: false, error: 'passwordsDoNotMatch' }
        if (newPassword.length < 8)
            return { success: false, error: 'passwordTooShort' }

        loading.value = true
        const res = await api.post('/auth/update-password', { oldPassword: currentPassword, newPassword })
        loading.value = false
        return res.success
            ? { success: true, message: 'passwordUpdated' }
            : { success: false, error: res.error || 'passwordUpdateError' }
    }

    return { isAuthenticated, loading, otpPending, checkAuth, login, verifyOtp, cancelOtp, logout, forgotPassword, updatePassword }
}