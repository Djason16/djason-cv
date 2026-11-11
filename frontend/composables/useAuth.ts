import { api } from '@/utils/api'
import { withTrailingSlash } from '@/utils/pathHelpers'

/*
 * Admin session: login in two steps (password, then the code received by email), logout, password change.
 *   const { isAuthenticated, login, verifyOtp, logout } = useAuth()
 */

// A new page load (the session is read again): after a login or a logout, once its message was shown (utils/feedback.js)
export const goToPage = (path: string) => {
    if (process.client) window.location.href = withTrailingSlash(path)
}

// Session check of this page load (browser only): the plugin, the middlewares and the footer share one request
let sessionCheck = null

export const useAuth = () => {
    const isAuthenticated = useState('isAuthenticated', () => false)
    // true once the session check answered (the footer waits for it to show "Login" or "Admin")
    const authChecked = useState('authChecked', () => false)
    const loading = useState('authLoading', () => false)

    // Asks the server once whether the visitor is logged in; resolves to true / false
    const checkAuth = () => {
        sessionCheck ??= api.get('/auth/check-session').then(res => {
            isAuthenticated.value = Boolean(res.success && res.authenticated)
            authChecked.value = true
            return isAuthenticated.value
        })
        return sessionCheck
    }

    // Pending OTP state — stores userId between login and OTP verification
    const otpPending = useState('otpPending', () => ({ active: false, userId: null }))

    // Validates credentials and triggers OTP flow if correct
    const login = async (email: string, password: string) => {
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
    const verifyOtp = async (code: string) => {
        if (!code) return { success: false, error: 'missingOtp' }

        loading.value = true
        const res = await api.post('/auth/verify-otp', { userId: otpPending.value.userId, code })
        if (!res.success) {
            loading.value = false
            return { success: false, error: res.error || 'invalidOtp' }
        }

        // Logged in: the caller shows the message, then opens the admin page (goToPage); the button stays busy until then
        otpPending.value = { active: false, userId: null }
        isAuthenticated.value = true
        return { success: true, message: 'loginSuccess' }
    }

    // Resets OTP state without redirecting
    const cancelOtp = () => {
        otpPending.value = { active: false, userId: null }
    }

    // Logout: the session is closed; the caller shows the message, then goes home (goToPage: a new page load, logged out)
    const logout = async () => {
        const res = await api.post('/auth/logout')
        return Boolean(res.success)
    }

    // Sends temporary password after security answer verification
    const forgotPassword = async (email: string, securityAnswer: string, locale: string) => {
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
    const updatePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
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

    return { isAuthenticated, authChecked, loading, checkAuth, login, verifyOtp, cancelOtp, logout, forgotPassword, updatePassword }
}