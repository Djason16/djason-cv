export default defineEventHandler(async event => {
    const db = event.context.db
    const { oldPassword, newPassword } = await readBody(event)
    if (!oldPassword || !newPassword) throw createError({ statusCode: 400, message: 'missingFields' })

    const cookie = event.node.req.headers.cookie
    const userId = await getSessionUser(cookie, db)
    if (!userId) throw createError({ statusCode: 401, message: 'notAuthenticated' })

    const { rows } = await db.sql`SELECT password FROM dc_users WHERE id=${userId} LIMIT 1`
    if (!rows.length) throw createError({ statusCode: 404, message: 'userNotFound' })

    if (!await verifyPassword(oldPassword, rows[0].password))
        throw createError({ statusCode: 401, message: 'invalidOldPassword' })

    const hashed = await hashPassword(newPassword)
    await db.sql`UPDATE dc_users SET password=${hashed} WHERE id=${userId}`

    return { success: true, message: 'passwordUpdated' }
})