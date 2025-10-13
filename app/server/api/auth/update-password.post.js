export default defineEventHandler(async event => {
    const db = event.context.db || useDatabase()
    const { oldPassword, newPassword } = await readBody(event)

    // Validate required fields
    if (!oldPassword || !newPassword) {
        throw createError({ statusCode: 400, message: 'missingFields' })
    }

    // Validate new password strength (optional but recommended)
    if (newPassword.length < 8) {
        throw createError({ statusCode: 400, message: 'passwordTooShort' })
    }

    // Authenticate user via session cookie
    const cookie = event.node.req.headers.cookie
    const userId = await getSessionUser(cookie, db)
    if (!userId) {
        throw createError({ statusCode: 401, message: 'notAuthenticated' })
    }

    // Fetch current hashed password
    const { rows } = await db.sql`
        SELECT password FROM dc_users WHERE id=${userId} LIMIT 1
    `
    if (!rows.length) {
        throw createError({ statusCode: 404, message: 'userNotFound' })
    }

    // Verify old password matches
    if (!await verifyPassword(oldPassword, rows[0].password)) {
        throw createError({ statusCode: 401, message: 'invalidOldPassword' })
    }

    //  Hash new password and update database
    const hashedNewPassword = await hashPassword(newPassword)
    await db.sql`
        UPDATE dc_users SET password=${hashedNewPassword} WHERE id=${userId}
    `

    return { success: true, message: 'passwordUpdated' }
})