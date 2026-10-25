import { DatabaseHelper } from './DatabaseHelper.js'
import { RequestHelper } from './RequestHelper.js'

/**
 * Base class for every controller in server/controllers/ (DC Scaffold convention: https://github.com/Djason16/dc-scaffold):
 * short helpers so each controller stays small. Routes are built from the method names
 * by RouteDiscovery (getAll, getOne, create, update, delete, or "static routes").
 *
 *   export default class ProductsController extends Controller {
 *       async getAll(event) {
 *           return ResponseHelper.success(event, { products: await this.fetchAll('SELECT * FROM products') })
 *       }
 *   }
 *
 * Access: every route needs an admin session (checked in server/api/[...path].js),
 * except the methods listed in "static publicActions" (or every method with publicActions = true).
 */
export class Controller {
    // Optional: change the URL prefix (default ProductsController -> /products)
    static prefix

    // Optional: routes the REST naming cannot guess, e.g. { markShipped: ['POST', '/{id}/mark-shipped'] }
    static routes = {}

    // Optional: methods reachable without a session, e.g. ['getAll'], or true for the whole controller
    static publicActions = []

    body = event => RequestHelper.body(event)
    fetchAll = (sql, params) => DatabaseHelper.fetchAll(sql, params)
    fetchOne = (sql, params) => DatabaseHelper.fetchOne(sql, params)
    insert = (sql, params) => DatabaseHelper.insert(sql, params)
    execute = (sql, params) => DatabaseHelper.execute(sql, params)
}
