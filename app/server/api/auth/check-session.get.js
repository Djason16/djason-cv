export default defineEventHandler(async event => {
    const db = event.context.db || useDatabase()
    const cookieHeader = event.node.req.headers.cookie

    // Retrieve user ID from session cookie
    const userId = await getSessionUser(cookieHeader, db)

    // Return authentication status and user ID
    return { authenticated: !!userId, userId: userId || null }
})