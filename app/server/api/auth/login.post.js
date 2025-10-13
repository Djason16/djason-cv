export default defineEventHandler(async event => {
    const { email, password } = await readBody(event)
    const db = event.context.db || useDatabase()

    // Validate input
    if (!email || !password) {
        throw createError({ statusCode: 400, message: 'authErrorMissingFields' })
    }

    // Fetch user by email
    const { rows } = await db.sql`
        SELECT id, password FROM dc_users WHERE email=${email} LIMIT 1
    `
    if (!rows.length) {
        throw createError({ statusCode: 401, message: 'invalidCredentials' })
    }

    const user = rows[0]

    // Verify password
    if (!await verifyPassword(password, user.password)) {
        throw createError({ statusCode: 401, message: 'invalidCredentials' })
    }

    // Create session and set cookie with event context
    const cookie = await createSession(user.id, db, event)
    setHeader(event, 'Set-Cookie', cookie)

    return { success: true, userId: user.id, message: 'loginSuccess' }
})