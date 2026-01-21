import { deleteSession, getCookieOptions } from '~/server/utils/db-utils/session'

export default defineEventHandler(async event => {
    const db = event.context.db || useDatabase()
    const cookieHeader = event.node.req.headers.cookie

    // Remove session from DB
    await deleteSession(cookieHeader, db)

    // Delete session cookie with consistent options
    deleteCookie(event, 'sid', getCookieOptions(event))

    return { success: true, message: 'logoutSuccess' }
})