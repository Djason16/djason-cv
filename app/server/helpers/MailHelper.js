import nodemailer from 'nodemailer'

/*
 * Email sending with the SMTP settings of the .env file (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS).
 * Templates are in server/templates/MailTemplates.js.
 *
 *   await MailHelper.send({ to, subject, text, html })
 *   const mailer = MailHelper.pool()   ...   mailer.send(...)   ...   await mailer.close()
 */

const transportOptions = config => ({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: config.smtpSecure === true || config.smtpSecure === 'true',
    auth: { user: config.smtpUser, pass: config.smtpPass },
})

// Sender shown in every email: "Site name" <smtp account>
const from = config => `"${config.public.name}" <${config.smtpUser}>`

export const MailHelper = {
    /** Address of the SMTP account, which receives the admin emails (OTP, temporary password). */
    adminAddress: () => useRuntimeConfig().smtpUser,

    /** Sends one email. */
    async send(message) {
        const config = useRuntimeConfig()
        const transporter = nodemailer.createTransport(transportOptions(config))
        return transporter.sendMail({ from: from(config), ...message })
    },

    /** Pooled connection for a batch of emails (agenda): close() it at the end. */
    pool() {
        const config = useRuntimeConfig()
        const transporter = nodemailer.createTransport({ ...transportOptions(config), pool: true, maxConnections: 5, maxMessages: 100 })
        return {
            send: message => transporter.sendMail({ from: from(config), ...message }),
            close: () => transporter.close(),
        }
    },

    /** Escapes a user value before putting it in an HTML email. */
    escape: value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]),
}
