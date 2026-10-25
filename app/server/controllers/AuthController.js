import { randomBytes, randomInt, timingSafeEqual } from 'node:crypto'

/*
 * Admin login in two steps: email + password, then a 6-digit code sent by email (valid 10 minutes).
 * Error messages are translation keys displayed by the login page (plugins/translations/pages/login.js).
 * Failed attempts are limited per account and per IP (server/helpers/RateLimitHelper.js).
 */
const OTP_LIFETIME = 10 * 60 * 1000

// Same comparison time whatever the input, so the code cannot be guessed digit by digit
const sameCode = (expected, given) => {
    const a = Buffer.from(String(expected))
    const b = Buffer.from(String(given).trim())
    return a.length === b.length && timingSafeEqual(a, b)
}

const lower = value => String(value || '').trim().toLowerCase()

export default class AuthController extends Controller {
    static publicActions = ['checkSession', 'login', 'verifyOtp', 'logout', 'sendTempPassword']

    static routes = {
        checkSession: ['GET', '/check-session'],
        login: ['POST', '/login'],
        verifyOtp: ['POST', '/verify-otp'],
        logout: ['POST', '/logout'],
        sendTempPassword: ['POST', '/send-temp-password'],
        updatePassword: ['POST', '/update-password'],
    }

    // GET /api/auth/check-session
    async checkSession(event) {
        const userId = await SessionHelper.userId(event)
        return ResponseHelper.success(event, { authenticated: Boolean(userId), userId: userId || null })
    }

    // POST /api/auth/login: checks the password, then sends the OTP code to the admin mailbox
    async login(event) {
        const { email, password } = await this.body(event)
        if (!email || !password) return ResponseHelper.validationError(event, 'authErrorMissingFields')

        const keys = [`login:${lower(email)}`, `login-ip:${RequestHelper.ip(event)}`]
        const limit = await RateLimitHelper.check(keys)
        if (limit.locked) return ResponseHelper.tooManyRequests(event, 'tooManyAttempts', limit.retryAfter)

        const user = await this.fetchOne('SELECT id, password FROM dc_users WHERE email = ? LIMIT 1', [email])
        if (!user || !(await SessionHelper.verifyPassword(password, user.password))) {
            const locked = await RateLimitHelper.fail(keys, RateLimitHelper.LOGIN)
            return locked ? ResponseHelper.tooManyRequests(event, 'tooManyAttempts', RateLimitHelper.LOGIN.lockSeconds) : ResponseHelper.authError(event, 'invalidCredentials')
        }
        await RateLimitHelper.reset(keys)

        // One pending code per user
        const code = String(randomInt(100000, 1000000))
        await this.execute('DELETE FROM dc_otp WHERE user_id = ?', [user.id])
        await this.insert('INSERT INTO dc_otp (id, user_id, code, expires_at) VALUES (?, ?, ?, ?)',
            [DatabaseHelper.uuid(), user.id, code, new Date(Date.now() + OTP_LIFETIME).toISOString()])

        const config = useRuntimeConfig()
        const adminName = config.public.name
        try {
            await MailHelper.send({
                to: MailHelper.adminAddress(),
                subject: `${adminName} - Code de connexion`,
                text: `Votre code de connexion est : ${code}\nIl expire dans 10 minutes.`,
                html: MailTemplates.otp({ code, adminName, locale: 'fr', config }),
            })
        } catch (error) {
            console.error('[MAIL] Sending OTP failed:', error)
            return ResponseHelper.serverError(event, 'errorSendingOtp')
        }

        // Password checked, code sent: the session is created by verify-otp
        return ResponseHelper.success(event, { otpRequired: true, userId: user.id })
    }

    // POST /api/auth/verify-otp: checks the code and opens the session
    async verifyOtp(event) {
        const { userId, code } = await this.body(event)
        if (!userId || !code) return ResponseHelper.validationError(event, 'missingFields')

        // Counted per account: a new login, a new session or another browser does not reset it
        const keys = [`otp:${userId}`, `otp-ip:${RequestHelper.ip(event)}`]
        const limit = await RateLimitHelper.check(keys)
        if (limit.locked) return ResponseHelper.tooManyRequests(event, 'tooManyAttempts', limit.retryAfter)

        const otp = await this.fetchOne('SELECT code, expires_at FROM dc_otp WHERE user_id = ? LIMIT 1', [userId])

        if (otp && new Date(otp.expires_at) < new Date()) {
            await this.execute('DELETE FROM dc_otp WHERE user_id = ?', [userId])
            return ResponseHelper.authError(event, 'otpExpired')
        }

        if (!otp || !sameCode(otp.code, code)) {
            const locked = await RateLimitHelper.fail(keys, RateLimitHelper.OTP)
            if (!locked) return ResponseHelper.authError(event, 'invalidOtp')
            // Too many wrong codes: this code can no longer be used
            await this.execute('DELETE FROM dc_otp WHERE user_id = ?', [userId])
            return ResponseHelper.tooManyRequests(event, 'tooManyAttempts', RateLimitHelper.OTP.lockSeconds)
        }

        await this.execute('DELETE FROM dc_otp WHERE user_id = ?', [userId])
        await RateLimitHelper.reset(keys)
        await SessionHelper.create(event, userId)
        return ResponseHelper.success(event, { message: 'loginSuccess' })
    }

    // POST /api/auth/logout
    async logout(event) {
        await SessionHelper.destroy(event)
        return ResponseHelper.success(event, { message: 'logoutSuccess' })
    }

    // POST /api/auth/send-temp-password: after the right security answer, a temporary password is emailed to the admin
    async sendTempPassword(event) {
        const { email, securityAnswer, locale = 'fr', message = '' } = await this.body(event)
        if (!email || !securityAnswer) return ResponseHelper.validationError(event, 'missingFields')

        const config = useRuntimeConfig()
        if (!config.securityAnswer) return ResponseHelper.serverError(event, 'securityQuestionNotConfigured')
        if (!config.adminEmail) return ResponseHelper.serverError(event, 'adminEmailNotConfigured')

        // The answer is the same for every account: limited per IP and for the whole site
        const keys = [`reset-ip:${RequestHelper.ip(event)}`, 'reset:all']
        const limit = await RateLimitHelper.check(keys)
        if (limit.locked) return ResponseHelper.tooManyRequests(event, 'tooManyAttempts', limit.retryAfter)

        if (lower(securityAnswer) !== lower(config.securityAnswer)) {
            const locked = await RateLimitHelper.fail(keys, RateLimitHelper.SECURITY_ANSWER)
            return locked ? ResponseHelper.tooManyRequests(event, 'tooManyAttempts', RateLimitHelper.SECURITY_ANSWER.lockSeconds) : ResponseHelper.authError(event, 'incorrectSecurityAnswer')
        }

        const user = await this.fetchOne('SELECT id, email FROM dc_users WHERE email = ? LIMIT 1', [email])
        if (!user) return ResponseHelper.notFound(event, 'userNotFound')

        const tempPassword = randomBytes(6).toString('base64')
        const adminName = config.public.name
        const en = locale === 'en'
        const subject = en ? `${adminName} - Temporary password` : `${adminName} - Mot de passe temporaire`
        const details = en
            ? `User: ${user.email}\nTemporary password: ${tempPassword}`
            : `Utilisateur: ${user.email}\nMot de passe temporaire: ${tempPassword}`

        // Email first: the password only changes once the admin has received it
        try {
            await MailHelper.send({
                to: MailHelper.adminAddress(),
                subject,
                text: message ? `${message}\n\n${details}` : details,
                html: MailTemplates.tempPassword({ userEmail: user.email, tempPassword, message: MailHelper.escape(message), adminName, locale, config }),
            })
        } catch (error) {
            console.error('[MAIL] Sending temp password failed:', error)
            return ResponseHelper.serverError(event, 'errorSendingTempPassword')
        }

        await this.execute('UPDATE dc_users SET password = ? WHERE id = ?', [await SessionHelper.hashPassword(tempPassword), user.id])
        await SessionHelper.destroyAll(user.id)
        await RateLimitHelper.reset(keys)
        return ResponseHelper.success(event, { message: 'tempPasswordSentToAdmin' })
    }

    // POST /api/auth/update-password (admin session)
    async updatePassword(event) {
        const { oldPassword, newPassword } = await this.body(event)
        if (!oldPassword || !newPassword) return ResponseHelper.validationError(event, 'missingFields')
        if (newPassword.length < 8) return ResponseHelper.validationError(event, 'passwordTooShort')

        const userId = event.context.userId
        const user = await this.fetchOne('SELECT password FROM dc_users WHERE id = ? LIMIT 1', [userId])
        if (!user) return ResponseHelper.notFound(event, 'userNotFound')
        if (!(await SessionHelper.verifyPassword(oldPassword, user.password))) return ResponseHelper.authError(event, 'invalidOldPassword')

        await this.execute('UPDATE dc_users SET password = ? WHERE id = ?', [await SessionHelper.hashPassword(newPassword), userId])
        return ResponseHelper.success(event, { message: 'passwordUpdated' })
    }
}
