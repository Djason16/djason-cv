// Services offered (filled at startup by server/helpers/DatabaseSchema.js): GET /api/services
export default class ServicesController extends Controller {
    async getAll(event) {
        const services = await this.fetchAll(`
            SELECT id, client_id, name, description, date_start, date_end, hours, quantity, unit_price, vat_applicable
            FROM dc_services
            ORDER BY created_at DESC`)
        return ResponseHelper.success(event, { services })
    }
}
