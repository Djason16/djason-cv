export default defineEventHandler(async event => {
    // Access database and cookies from request context
    const { db } = event.context
    const cookieHeader = event.node.req.headers.cookie

    // Retrieve user ID from session cookie
    const userId = await getSessionUser(cookieHeader, db)

    // Return authentication status and user ID
    return { authenticated: !!userId, userId: userId || null }
})