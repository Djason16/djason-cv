/*
 * Machine translation of a text written in the admin, to fill the other languages (server/helpers/TranslateHelper.js):
 *   POST /api/translate   { text, from: 'fr', to: ['en'] } -> { translations: { en: '...' } }   (admin only)
 */
export default class TranslateController extends Controller {
    async create(event) {
        const body = (await this.body(event)) || {}
        const text = String(body.text ?? '').trim()
        if (!text) return ResponseHelper.success(event, { translations: {} })
        try {
            const translations = await TranslateHelper.translate(text, String(body.from || 'fr'), Array.isArray(body.to) ? body.to : [])
            return ResponseHelper.success(event, { translations })
        } catch (error) {
            // Service down or free quota used up: a message, never a broken form
            const known = ['translateQuota', 'translateUnavailable', 'translateLanguage', 'translateTooLong']
            return ResponseHelper.error(event, known.includes(error.message) ? error.message : 'translateUnavailable', 503)
        }
    }
}
