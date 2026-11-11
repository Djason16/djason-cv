import type { H3Event } from 'h3'
/*
 * Texts of the site changed from the admin (server/helpers/TextsHelper.js):
 *   GET /api/texts   the changed texts { fr: {...}, en: {...} } (public: they are shown on the site)
 *   PUT /api/texts   { lang: 'fr', key: 'heroTitle', value: '...' } saved; an empty value goes back to the default (admin only)
 */
export default class TextsController extends Controller {
    static publicActions = ['getAll']
    static routes = { save: ['PUT', ''] }

    async getAll(event: H3Event) {
        return ResponseHelper.success(event, { texts: await TextsHelper.changed() })
    }

    async save(event: H3Event) {
        const { lang, key, value } = (await this.body(event)) || {}
        if (!(await TextsHelper.save(lang, key, value))) return ResponseHelper.validationError(event, 'Unknown text')
        return ResponseHelper.success(event, { texts: await TextsHelper.changed() })
    }
}
