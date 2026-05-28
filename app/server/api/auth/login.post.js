import crypto from 'crypto'
import nodemailer from 'nodemailer'

export default defineEventHandler(async event => {
    const { email, password } = await readBody(event)
    const db = event.context.db || useDatabase()
    const config = useRuntimeConfig(event)
    const adminName = config.public.name

    if (!email || !password)
        throw createError({ statusCode: 400, message: 'authErrorMissingFields' })

    // Fetch user by email
    const { rows } = await db.sql`
        SELECT id, password FROM dc_users WHERE email=${email} LIMIT 1
    `
    if (!rows.length)
        throw createError({ statusCode: 401, message: 'invalidCredentials' })

    const user = rows[0]

    // Verify password
    if (!await verifyPassword(password, user.password))
        throw createError({ statusCode: 401, message: 'invalidCredentials' })

    // Generate 6-digit OTP with 10 min expiry
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Replace any existing OTP for this user before inserting
    await db.sql`DELETE FROM dc_otp WHERE user_id=${user.id}`
    await db.sql`
        INSERT INTO dc_otp (id, user_id, code, expires_at)
        VALUES (${crypto.randomUUID()}, ${user.id}, ${code}, ${expiresAt})
    `

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: Number(config.smtpPort),
        secure: config.smtpSecure === 'true',
        auth: { user: config.smtpUser, pass: config.smtpPass }
    })

    // Send OTP to user email
    try {
        await transporter.sendMail({
            from: `"${adminName}" <${config.smtpUser}>`,
            to: config.smtpUser,
            subject: `${adminName} - Code de connexion`,
            text: `Votre code de connexion est : ${code}\nIl expire dans 10 minutes.`,
            html: renderOtpEmail({ code, adminName, locale: 'fr', config })
        })
    } catch (err) {
        console.error('[MAIL] Sending OTP failed:', err)
        throw createError({ statusCode: 500, message: 'errorSendingOtp' })
    }

    // Credentials valid — OTP sent, session not created yet
    return { success: true, otpRequired: true, userId: user.id }
})