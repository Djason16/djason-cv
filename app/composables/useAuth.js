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

    // Check current session validity against the server
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

    // Pending OTP state — stores userId between login and OTP verification
    const otpPending = useState('otpPending', () => ({ active: false, userId: null }))

    // Validate credentials and trigger OTP flow if correct
    const login = async (email, password) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return { success: false, error: 'invalidEmail' }
        if (!password)
            return { success: false, error: 'passwordRequired' }

        loading.value = true
        try {
            const res = await $fetch('/api/auth/login', { method: 'POST', body: { email, password } })
            loading.value = false

            // Credentials valid — OTP sent, wait for verification
            if (res.otpRequired) {
                otpPending.value = { active: true, userId: res.userId }
                return { success: true, otpRequired: true, message: 'otpSent' }
            }

            return { success: true, message: res.message }
        } catch (err) {
            loading.value = false
            return { success: false, error: err.data?.message || 'invalidCredentials' }
        }
    }

    // Verify OTP code and create session on success
    const verifyOtp = async (code) => {
        if (!code) return { success: false, error: 'missingOtp' }

        loading.value = true
        try {
            await $fetch('/api/auth/verify-otp', {
                method: 'POST',
                body: { userId: otpPending.value.userId, code }
            })
            otpPending.value = { active: false, userId: null }
            await checkAuth()
            await delayedRedirect('/admin')
            loading.value = false
            return { success: true, message: 'loginSuccess' }
        } catch (err) {
            loading.value = false
            return { success: false, error: err.data?.message || 'invalidOtp' }
        }
    }

    // Reset OTP state without redirecting
    const cancelOtp = () => {
        otpPending.value = { active: false, userId: null }
    }

    // Logout, invalidate session and redirect to home
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

    // Send temporary password after security answer verification
    const forgotPassword = async (email, securityAnswer, locale) => {
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return { success: false, error: 'invalidEmail' }
        if (!securityAnswer)
            return { success: false, error: 'enterSecurityAnswer' }

        loading.value = true
        try {
            const res = await $fetch('/api/auth/send-temp-password', {
                method: 'POST',
                body: { email, securityAnswer, locale, message: '' }
            })
            loading.value = false
            return res.success
                ? { success: true, message: res.message }
                : { success: false, error: res.error || res.message || 'errorSendingTempPassword' }
        } catch (err) {
            loading.value = false
            const key = err.data?.message || (err.statusCode === 401 ? 'incorrectSecurityAnswer' : 'errorSendingTempPassword')
            return { success: false, error: key }
        }
    }

    // Update password after verifying the current one
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

    return { isAuthenticated, loading, otpPending, checkAuth, login, verifyOtp, cancelOtp, logout, forgotPassword, updatePassword }
}