import { useDatabase } from '#imports'
import { createError, defineEventHandler, sendError } from 'h3'

export default defineEventHandler(async event => {
    const url = event.node.req.url || ''
    const method = (event.node.req.method || 'GET').toUpperCase()
    const publicRoutes = ['/api/database/setup', '/api/upload/']
    const readOnlyRoutes = ['/api/unavailability/', '/api/availability/', '/api/calendar/', '/api/projects/']
    const protectedRoutes = ['/api/env/', '/api/bank/', '/api/clients/', '/api/services/', '/api/missions/', '/api/interest-rates/', '/api/database/']

    // Skip public routes
    if (publicRoutes.some(route => url.startsWith(route))) return

    // For read-only routes: allow only GET, block everything else
    const isReadOnly = readOnlyRoutes.some(route => url.startsWith(route))
    if (isReadOnly && method === 'GET') return

    // Skip if URL is not protected and not read-only
    const isProtected = protectedRoutes.some(prefix => url.startsWith(prefix))
    if (!isProtected && !isReadOnly) return

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