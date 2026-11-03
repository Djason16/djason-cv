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

// The titles drawn as images (MailLayout: src="cid:title-<file>") put in the email itself: shown even before the site is online
const withTitles = message => {
    const files = [...String(message.html || '').matchAll(/cid:title-([\w.-]+)/g)].map(m => m[1])
    const images = [...new Set(files)].map(file => Object.values(MailTitles).find(title => title.file === file)).filter(Boolean)
    if (!images.length) return message
    return { ...message, attachments: [...(message.attachments || []), ...images.map(image => ({
        filename: image.file, content: Buffer.from(image.data, 'base64'), contentType: 'image/png', cid: `title-${image.file}`, contentDisposition: 'inline',
    }))] }
}

// Sender shown in every email: "Name of the owner" (admin > Settings) <smtp account>
const from = async config => `"${(await SettingsHelper.all()).name}" <${config.smtpUser}>`

export const MailHelper = {
    /** Address of the SMTP account, which receives the admin emails (OTP, temporary password). */
    adminAddress: () => useRuntimeConfig().smtpUser,

    /** Sends one email. */
    async send(message) {
        const config = useRuntimeConfig()
        const transporter = nodemailer.createTransport(transportOptions(config))
        return transporter.sendMail({ from: await from(config), ...withTitles(message) })
    },

    /** Pooled connection for a batch of emails (agenda): close() it at the end. */
    pool() {
        const config = useRuntimeConfig()
        const transporter = nodemailer.createTransport({ ...transportOptions(config), pool: true, maxConnections: 5, maxMessages: 100 })
        // Sender read once for the whole batch
        let sender = null
        return {
            send: async message => transporter.sendMail({ from: (sender ??= await from(config)), ...withTitles(message) }),
            close: () => transporter.close(),
        }
    },

    /** Escapes a user value before putting it in an HTML email. */
    escape: value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]),
}
