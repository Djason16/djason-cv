import controllers from '#controllers'

// Every controller route, resolved once at startup (see server/utils/RouteDiscovery.js)
const routes = RouteDiscovery.scan(controllers)

// /api/clients -> ClientsController
// Access (this site), checked on the route that was actually matched: a route needs an admin session unless its
// controller lists it in "static publicActions". One form per address: /api/env, /api/env/ and /api//env/ are the same route.
export default defineEventHandler(async (event) => {
    // Everything up to /api goes away, the folder of a qualif too (/my-site/api/clients -> /clients)
    const path = `/${getRequestURL(event).pathname.replace(/^.*?\/api(?=\/|$)/, '')}`.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'
    const { route, args, pathExists } = RouteDiscovery.match(routes, event.method, path)

    if (!route) {
        return pathExists
            ? ResponseHelper.error(event, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED')
            : ResponseHelper.error(event, 'Route not found', 404, 'NOT_FOUND', { path: getRequestURL(event).pathname })
    }

    try {
        // The day of today of the owner (documents, payments) in the time zone of the agenda
        await TimeZoneHelper.ensure()
        if (!route.isPublic) {
            const userId = await SessionHelper.userId(event)
            if (!userId) return ResponseHelper.authError(event)
            event.context.userId = userId
        }

        // The tables the request changed, with their new versions: the browser keeps its own changes without loading them again
        const { result, writes } = await DatabaseHelper.track(() => route.handler(event, args))
        const changed = Object.entries(writes as Record<string, { version: number, count: number }>)
            .map(([table, w]) => `${table}:${w.version}:${w.count}`).join(',')
        if (changed && !event.node.res.headersSent) setResponseHeader(event, 'X-Data-Versions', changed)
        return result
    } catch (error) {
        return ResponseHelper.fromError(event, error)
    }
})
