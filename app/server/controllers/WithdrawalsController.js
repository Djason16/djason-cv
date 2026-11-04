/*
 * Online withdrawal of a consumer (art. L.221-21 of the French Consumer Code, in force since 19 June 2026):
 *   POST /api/withdrawals   { name, email, reference, message?, language }  public, a few per hour and per address
 *   GET  /api/withdrawals   the withdrawals received (admin only)
 * Each withdrawal is kept (dc_withdrawals, a proof) and sent at once: an acknowledgement to the consumer, a notice to the owner.
 */
const LIMIT = { max: 5, windowSeconds: 60 * 60, lockSeconds: 60 * 60 }
const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '')

export default class WithdrawalsController extends Controller {
    static publicActions = ['create']

    async getAll(event) {
        const withdrawals = await this.fetchAll('SELECT id, name, email, reference, message, language, created_at FROM dc_withdrawals ORDER BY created_at DESC')
        return ResponseHelper.success(event, { withdrawals })
    }

    async create(event) {
        const keys = [`withdrawal-ip:${RequestHelper.ip(event)}`]
        const limit = await RateLimitHelper.check(keys)
        if (limit.locked) return ResponseHelper.tooManyRequests(event, 'tooManyAttempts', limit.retryAfter)

        const body = (await this.body(event)) || {}
        const withdrawal = {
            id: DatabaseHelper.newId(),
            name: String(body.name || '').trim().slice(0, 255),
            email: String(body.email || '').trim().slice(0, 255),
            reference: String(body.reference || '').trim().slice(0, 255),
            message: String(body.message || '').trim().slice(0, 2000),
            language: body.language === 'en' ? 'en' : 'fr',
            createdAt: new Date(),
        }
        if (withdrawal.name.length < 2) return ResponseHelper.validationError(event, 'withdrawalNameRequired')
        if (!isEmail(withdrawal.email)) return ResponseHelper.validationError(event, 'invalidEmail')
        // Also a few sendings per hour for one address, whatever the IP
        keys.push(`withdrawal-email:${withdrawal.email.toLowerCase()}`)
        const byEmail = await RateLimitHelper.check(keys)
        if (byEmail.locked) return ResponseHelper.tooManyRequests(event, 'tooManyAttempts', byEmail.retryAfter)
        if (withdrawal.reference.length < 2) return ResponseHelper.validationError(event, 'withdrawalReferenceRequired')

        // Counted even when it works: a few sendings per hour and per address at most
        await RateLimitHelper.fail(keys, LIMIT)
        await this.insert('INSERT INTO dc_withdrawals (id, name, email, reference, message, language, ip) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [withdrawal.id, withdrawal.name, withdrawal.email, withdrawal.reference, withdrawal.message, withdrawal.language, RequestHelper.ip(event)])

        const settings = await SettingsHelper.all()
        const owner = settings.email || MailHelper.adminAddress()
        try {
            await MailHelper.send({ to: withdrawal.email, ...WithdrawalMails.receipt(withdrawal, settings) })
            await MailHelper.send({ to: owner, replyTo: withdrawal.email, ...WithdrawalMails.notice(withdrawal, settings) })
        } catch (error) {
            // Kept in the database even when an email fails: the owner finds it in the admin
            console.error('Withdrawal email failed:', error.message)
            return ResponseHelper.success(event, { id: withdrawal.id, emailSent: false })
        }
        return ResponseHelper.success(event, { id: withdrawal.id, emailSent: true })
    }
}
