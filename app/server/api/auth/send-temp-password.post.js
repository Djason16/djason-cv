import crypto from 'crypto'
import { createError, readBody } from 'h3'
import nodemailer from 'nodemailer'
import { renderTempPasswordEmail } from '~/server/utils/auth-utils/email-template.js'
import { hashPassword } from '~/server/utils/db-utils/user.js'

export default defineEventHandler(async event => {
    const db = event.context.db
    const config = useRuntimeConfig(event)
    const { email, securityAnswer, locale = 'fr', message = '' } = await readBody(event)

    // Validate required fields
    if (!email || !securityAnswer) throw createError({ statusCode: 400, message: 'missingFields' })
    const expectedAnswer = config.securityAnswer
    if (!expectedAnswer) throw createError({ statusCode: 500, message: 'securityQuestionNotConfigured' })
    if (securityAnswer.trim().toLowerCase() !== expectedAnswer.trim().toLowerCase())
        throw createError({ statusCode: 401, message: 'incorrectSecurityAnswer' })

    // Find user by email
    const { rows } = await db.sql`SELECT id, email FROM dc_users WHERE email=${email} LIMIT 1`
    if (!rows.length) throw createError({ statusCode: 404, message: 'userNotFound' })
    const user = rows[0]

    // Generate temporary password and store hashed version
    const tempPassword = crypto.randomBytes(6).toString('base64')
    await db.sql`UPDATE dc_users SET password=${await hashPassword(tempPassword)} WHERE id=${user.id}`

    const adminEmail = config.adminEmail
    if (!adminEmail) throw createError({ statusCode: 500, message: 'adminEmailNotConfigured' })

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort),
        secure: config.smtpSecure === 'true',
        auth: { user: config.smtpUser, pass: config.smtpPass }
    })

    const adminName = config.public.name

    // Prepare email content
    const subject = locale === 'en'
        ? `${adminName} - Temporary password for ${user.email}`
        : `${adminName} - Mot de passe temporaire pour ${user.email}`

    const text = message
        ? `${message}\n\n${locale === 'en' ? 'User' : 'Utilisateur'}: ${user.email}\n${locale === 'en' ? 'Temporary password' : 'Mot de passe temporaire'}: ${tempPassword}`
        : locale === 'en'
            ? `User: ${user.email}\nTemporary password: ${tempPassword}`
            : `Utilisateur: ${user.email}\nMot de passe temporaire: ${tempPassword}`

    const mailOptions = {
        from: `"${adminName}" <${config.smtpUser}>`, // sender = SMTP
        to: config.smtpUser, // mail arrives to the SMTP account itself
        subject,
        text,
        html: renderTempPasswordEmail({ userEmail: user.email, tempPassword, message, adminName, locale, config })
    }

    // Send email and handle errors
    try {
        await transporter.sendMail(mailOptions)
    } catch (err) {
        console.error('[MAIL] Sending temp password failed:', err)
        throw createError({ statusCode: 500, message: 'errorSendingTempPassword' })
    }

    return { success: true, message: 'tempPasswordSentToAdmin' }
})