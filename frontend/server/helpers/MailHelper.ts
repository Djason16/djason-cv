import nodemailer from 'nodemailer'
import type { SendMailOptions } from 'nodemailer'

/*
 * Email sending with the SMTP settings of the .env file (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS).
 * Templates are in server/templates/MailTemplates.js.
 *
 *   await MailHelper.send({ to, subject, text, html })
 *   const mailer = MailHelper.pool()   ...   mailer.send(...)   ...   await mailer.close()
 */

const transportOptions = (config: Record<string, any>) => ({
    host: config.smtpHost,
    port: Number(config.smtpPort),
    secure: config.smtpSecure === true || config.smtpSecure === 'true',
    auth: { user: config.smtpUser, pass: config.smtpPass },
})

// The titles drawn as images (MailLayout: src="cid:title-<file>") put in the email itself: shown even before the site is online
// An email: to, subject, text, html, attachments... (nodemailer)
export type Mail = SendMailOptions

const withTitles = (message: Mail): Mail => {
    const files = [...String(message.html || '').matchAll(/cid:title-([\w.-]+)/g)].map(m => m[1])
    const images = [...new Set(files)].map(file => Object.values(MailTitles).find(title => title.file === file)).filter((title): title is NonNullable<typeof title> => Boolean(title))
    if (!images.length) return message
    return { ...message, attachments: [...(message.attachments || []), ...images.map(image => ({
        filename: image.file, content: Buffer.from(image.data, 'base64'), contentType: 'image/png', cid: `title-${image.file}`, contentDisposition: 'inline' as const,
    }))] }
}

// Sender shown in every email: "Name of the owner" (admin > Settings) <smtp account>
const from = async (config: Record<string, any>) => `"${(await SettingsHelper.all()).name}" <${config.smtpUser}>`

export const MailHelper = {
    /** Address of the SMTP account, which receives the admin emails (OTP, temporary password). */
    adminAddress: () => useRuntimeConfig().smtpUser,

    /** Sends one email. */
    async send(message: Mail) {
        const config = useRuntimeConfig()
        const transporter = nodemailer.createTransport(transportOptions(config))
        return transporter.sendMail({ from: await from(config), ...withTitles(message) })
    },

    /** Pooled connection for a batch of emails (agenda): close() it at the end. */
    pool() {
        const config = useRuntimeConfig()
        const transporter = nodemailer.createTransport({ ...transportOptions(config), pool: true, maxConnections: 5, maxMessages: 100 })
        // Sender read once for the whole batch
        let sender: string | null = null
        return {
            send: async (message: Mail) => transporter.sendMail({ from: (sender ??= await from(config)), ...withTitles(message) }),
            close: () => transporter.close(),
        }
    },

    /** Escapes a user value before putting it in an HTML email. */
    escape: (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] ?? c),
}
