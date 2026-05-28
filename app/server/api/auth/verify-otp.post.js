import crypto from 'crypto'

export default defineEventHandler(async event => {
    const { userId, code } = await readBody(event)
    const db = event.context.db || useDatabase()

    if (!userId || !code)
        throw createError({ statusCode: 400, message: 'missingFields' })

    // Fetch stored OTP for this user
    const { rows } = await db.sql`
        SELECT code, expires_at FROM dc_otp WHERE user_id=${userId} LIMIT 1
    `
    if (!rows.length)
        throw createError({ statusCode: 401, message: 'invalidOtp' })

    const otp = rows[0]

    // Reject if OTP has expired
    if (new Date(otp.expires_at) < new Date()) {
        await db.sql`DELETE FROM dc_otp WHERE user_id=${userId}`
        throw createError({ statusCode: 401, message: 'otpExpired' })
    }

    // Constant-time comparison to prevent timing attacks
    const valid = crypto.timingSafeEqual(
        Buffer.from(otp.code),
        Buffer.from(code.trim())
    )
    if (!valid)
        throw createError({ statusCode: 401, message: 'invalidOtp' })

    // OTP valid — clean up and create session
    await db.sql`DELETE FROM dc_otp WHERE user_id=${userId}`
    const cookie = await createSession(userId, db, event)
    setHeader(event, 'Set-Cookie', cookie)

    return { success: true, message: 'loginSuccess' }
})