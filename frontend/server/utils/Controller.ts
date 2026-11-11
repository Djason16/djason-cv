// dc-scaffold: adapted (publicActions: actions open without login; routes with their parameters)
import type { H3Event } from 'h3'

/**
 * Base class for every controller in controllers/: short helpers so each controller stays small.
 *
 *   export default class ProductsController extends Controller {
 *       async getAll(event) {
 *           return ResponseHelper.success(event, { products: await this.fetchAll('SELECT * FROM products') })
 *       }
 *   }
 *
 * Access (this site): every route needs an admin session (checked in server/api/[...path].ts),
 * except the methods listed in "static publicActions" (or every method with publicActions = true).
 */
export class Controller {
    // Optional: change the URL prefix (default ProductsController -> /products)
    static prefix?: string

    // Optional: routes the REST naming cannot guess, e.g. { markShipped: ['POST', '/{id}/mark-shipped'] }
    static routes: Record<string, string[]> = {}

    // Optional: methods reachable without a session, e.g. ['getAll'], or true for the whole controller
    static publicActions: string[] | boolean = []

    body = (event: H3Event) => RequestHelper.body(event)
    fetchAll = (sql: string, params?: unknown[]) => DatabaseHelper.fetchAll(sql, params)
    fetchOne = (sql: string, params?: unknown[]) => DatabaseHelper.fetchOne(sql, params)
    insert = (sql: string, params?: unknown[]) => DatabaseHelper.insert(sql, params)
    execute = (sql: string, params?: unknown[]) => DatabaseHelper.execute(sql, params)

    // Answer of an update or a delete by id: { id } when a row changed, else 404
    changed = (event: H3Event, changed: number | boolean, id: number | string, notFound?: string) =>
        changed ? ResponseHelper.success(event, { id }) : ResponseHelper.notFound(event, notFound)
}
