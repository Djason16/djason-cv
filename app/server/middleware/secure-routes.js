import { useDatabase } from '#imports'
import { createError, defineEventHandler, sendError } from 'h3'

export default defineEventHandler(async event => {
    const url = event.node.req.url || ''
    const publicRoutes = ['/api/database/setup']
    const protectedRoutes = ['/api/clients/', '/api/services/', '/api/missions/', 'api/interest-rates/', '/api/database/']

    // Skip public routes
    if (publicRoutes.some(route => url.startsWith(route))) return
    // Skip if URL is not protected
    if (!protectedRoutes.some(prefix => url.startsWith(prefix))) return

    const db = event.context.db || useDatabase()
    const cookie = event.node.req.headers.cookie || ''

    // Get user ID from session
    const userId = await getSessionUser(cookie, db).catch(err => {
        console.error('getSessionUser failed', err)
        return null
    })

    if (!userId) return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }))

    // Save user ID in context for downstream handlers
    event.context.userId = userId
})