import { deleteSession } from '~/server/utils/db-utils/session'

export default defineEventHandler(async event => {
    // Access database and request cookies
    const { db } = event.context
    const cookieHeader = event.node.req.headers.cookie

    // Remove session from DB
    await deleteSession(cookieHeader, db)

    // Delete session cookie in browser
    deleteCookie(event, 'sid', { httpOnly: true, sameSite: 'lax', path: '/' })

    // Return logout confirmation
    return { success: true, message: 'logoutSuccess' }
})