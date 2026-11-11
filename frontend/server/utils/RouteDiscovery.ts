// dc-scaffold: adapted (RouteArgs, action and isPublic of each route for the security of the admin)
/**
 * Builds the routes from the controllers (same rules as the PHP back ends).
 *
 * ProductsController -> prefix /products (FieldActionsController -> /field-actions)
 *   getAll()   GET          /products
 *   getOne()   GET          /products/{id}
 *   create()   POST         /products
 *   update()   PUT, PATCH   /products/{id}
 *   delete()   DELETE       /products/{id}
 *
 * Any other method becomes a route through: static routes = { markShipped: ['POST', '/{id}/mark-shipped'] }
 */
// Values of the {names} of the path of a route: { id: 'k3x9a2m4q8' }
export type RouteArgs = { id: string, [name: string]: string }

export type Route = { methods: string[], path: string, pattern: RegExp, handler: (...args: any[]) => any, action: string, isPublic: boolean }

const REST_ACTIONS: Record<string, [string[], string]> = {
    getAll: [['GET'], ''],
    getOne: [['GET'], '/{id}'],
    create: [['POST'], ''],
    update: [['PUT', 'PATCH'], '/{id}'],
    delete: [['DELETE'], '/{id}'],
}

// ProductsController -> /products
const defaultPrefix = (name: string) =>
    '/' + name.replace(/Controller$/, '').replace(/(?<!^)[A-Z]/g, '-$&').toLowerCase()

// '/products/{id}' -> /^\/products\/(?<id>[^/]+)$/
const toPattern = (path: string) => new RegExp(`^${path.replace(/\{(\w+)\}/g, '(?<$1>[^/]+)')}$`)

// [HTTP methods, path] for a controller method, or null when it is not a route
const routeOf = (ControllerClass: any, action: string): [string[], string] | null => {
    const custom: Record<string, string[]> = ControllerClass.routes ?? {}
    const own = custom[action]
    if (Object.hasOwn(custom, action) && own?.[0] && own[1] !== undefined) return [[own[0].toUpperCase()], own[1]]
    return REST_ACTIONS[action] ?? null
}

export const RouteDiscovery = {
    scan(controllers: { name: string, controller: any }[]) {
        const routes: Route[] = []

        for (const { name, controller: ControllerClass } of controllers) {
            const instance = new ControllerClass()
            const prefix = (ControllerClass.prefix ?? defaultPrefix(name)).replace(/\/$/, '')

            for (const action of Object.getOwnPropertyNames(ControllerClass.prototype)) {
                const route = action === 'constructor' ? null : routeOf(ControllerClass, action)
                if (!route) continue

                const path = (prefix + route[1]) || '/'
                // This site: every route needs a session unless the controller lists it in "static publicActions"
                const isPublic = ControllerClass.publicActions === true || (ControllerClass.publicActions ?? []).includes(action)
                routes.push({ methods: route[0], path, pattern: toPattern(path), handler: instance[action].bind(instance), action, isPublic })
            }
        }

        // Fixed paths first, so /products/export is not caught by /products/{id}
        return routes.sort((a, b) => a.path.split('{').length - b.path.split('{').length)
    },

    /** Finds the route for a request; pathExists tells a 405 from a 404 */
    match(routes: Route[], method: string, path: string) {
        let pathExists = false

        for (const route of routes) {
            const match = route.pattern.exec(path)
            if (!match) continue
            pathExists = true
            if (route.methods.includes(method)) return { route, args: { ...match.groups }, pathExists }
        }

        return { route: null, args: {}, pathExists }
    },
}
