/*
 * Information about the site owner (server/helpers/SettingsHelper.js):
 *   GET    /api/settings         every setting (public: it is shown on the site)
 *   PUT    /api/settings         { phone: '...', ... } saved (admin only)
 *   POST   /api/settings/photo   multipart form: image, the photo of "About me" (replaces the previous one, admin only)
 *   DELETE /api/settings/photo   back to the photo of the site (public/images/about-me.jpg, admin only)
 *   GET    /api/settings/area?address=Paris, France   the area shown for this address (Île-de-France, France), admin only
 * The photo is stored by server/helpers/UploadHelper.js, its path saved in the aboutPhoto setting.
 */
export default class SettingsController extends Controller {
    static publicActions = ['getAll']
    static routes = { save: ['PUT', ''], uploadPhoto: ['POST', '/photo'], resetPhoto: ['DELETE', '/photo'], area: ['GET', '/area'] }

    async getAll(event) {
        return ResponseHelper.success(event, { settings: await SettingsHelper.all() })
    }

    // The area of an address while it is typed in the admin (shown in the form before it is saved)
    async area(event) {
        // null: no service answered, the form keeps what it shows
        return ResponseHelper.success(event, { area: await AreaHelper.of(RequestHelper.query(event, 'address')) })
    }

    async save(event) {
        const body = await this.body(event)
        // The photo only changes through /photo (an uploaded image)
        const { aboutPhoto, ...changes } = body && typeof body === 'object' ? body : {}
        const saved = await SettingsHelper.save(changes)
        if (!saved.length) return ResponseHelper.validationError(event, 'Nothing to save')
        return ResponseHelper.success(event, { settings: await SettingsHelper.all() })
    }

    async uploadPhoto(event) {
        const { files } = await RequestHelper.multipart(event)
        if (!files.image) return ResponseHelper.validationError(event, 'No image provided')
        if (!UploadHelper.isAcceptedImage(files.image))
            return ResponseHelper.validationError(event, 'Image must be a JPG, PNG, GIF, WEBP or AVIF file')

        const previous = (await SettingsHelper.all()).aboutPhoto
        const imagePath = await UploadHelper.saveImage(files.image)
        await SettingsHelper.save({ aboutPhoto: imagePath })
        await UploadHelper.removeImage(previous)
        return ResponseHelper.success(event, { settings: await SettingsHelper.all() })
    }

    async resetPhoto(event) {
        const previous = (await SettingsHelper.all()).aboutPhoto
        await SettingsHelper.save({ aboutPhoto: '' })
        await UploadHelper.removeImage(previous)
        return ResponseHelper.success(event, { settings: await SettingsHelper.all() })
    }
}
