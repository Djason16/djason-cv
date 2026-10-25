import controllers from '#controllers'

/*
 * Router of every controller in server/controllers/ (DC Scaffold convention: https://github.com/Djason16/dc-scaffold, see server/helpers/RouteDiscovery.js):
 * ClientsController.getAll() -> GET /api/clients, update() -> PUT /api/clients/{id}...
 *
 * Access is checked here, on the route that was actually matched: a route needs an admin session
 * unless its controller lists it in "static publicActions". The path is normalized first (no trailing
 * or double slash), so /api/env, /api/env/ and /api//env/ all reach the same protected route.
 */
const routes = RouteDiscovery.scan(controllers)

const normalize = path => `/${path}`.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/'

export default defineEventHandler(async event => {
    const path = normalize(event.context.params?.path || '')
    const { route, args, pathExists } = RouteDiscovery.match(routes, event.method, path)

    if (!route)
        return pathExists
            ? ResponseHelper.error(event, 'Method not allowed', 405, 'METHOD_NOT_ALLOWED')
            : ResponseHelper.notFound(event, 'Route not found')

    try {
        if (!route.isPublic) {
            const userId = await SessionHelper.userId(event)
            if (!userId) return ResponseHelper.authError(event)
            event.context.userId = userId
        }

        return await route.handler(event, args)
    } catch (error) {
        return ResponseHelper.fromError(event, error)
    }
})
