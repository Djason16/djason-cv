/*
 * Projects shown on the home page (in addition to data/projects.js):
 *   GET    /api/projects              public list
 *   POST   /api/projects              multipart form: name, short_fr, short_en, link, skills, date, image
 *   PUT    /api/projects/{id}         JSON: any of name, short_fr, short_en, link, skills, date
 *   POST   /api/projects/{id}/image   multipart form: image (replaces the previous one)
 *   DELETE /api/projects/{id}
 * Images are stored by server/helpers/UploadHelper.js and served by /api/upload/...
 */
const EDITABLE = ['name', 'short_fr', 'short_en', 'link', 'date', 'skills']

// Skills arrive as a JSON array or as "a, b, c"
const parseSkills = value => {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return String(value).split(',').map(s => s.trim()).filter(Boolean)
    }
}

export default class ProjectsController extends Controller {
    static publicActions = ['getAll']

    static routes = { updateImage: ['POST', '/{id}/image'] }

    async getAll(event) {
        const rows = await this.fetchAll('SELECT id, name, short_fr, short_en, img, link, skills, date, created_at FROM dc_projects ORDER BY date DESC')
        const projects = rows.map(p => ({ ...p, skills: parseSkills(p.skills) }))
        return ResponseHelper.success(event, { projects })
    }

    async create(event) {
        const { fields, files } = await RequestHelper.multipart(event)
        if (RequestHelper.missing(fields, ['name', 'short_fr', 'short_en']).length)
            return ResponseHelper.validationError(event, 'Missing required fields: name, short_fr, short_en')
        if (files.image && !UploadHelper.isAcceptedImage(files.image))
            return ResponseHelper.validationError(event, 'Image must be a JPG, PNG, GIF, WEBP or AVIF file')

        const imagePath = files.image ? await UploadHelper.saveImage(files.image) : null
        const id = DatabaseHelper.uuid()
        await this.insert(
            'INSERT INTO dc_projects (id, name, short_fr, short_en, img, link, skills, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, fields.name, fields.short_fr, fields.short_en, imagePath, fields.link || null,
                JSON.stringify(parseSkills(fields.skills)), fields.date || new Date().toISOString().slice(0, 10)]
        )
        return ResponseHelper.success(event, { id, imagePath }, 201)
    }

    // Only the fields present in the body are changed
    async update(event, args) {
        const body = await this.body(event)
        const fields = EDITABLE.filter(field => body[field] !== undefined)
        if (!fields.length) return ResponseHelper.validationError(event, 'Nothing to update')

        const params = fields.map(field => field === 'skills' ? JSON.stringify(parseSkills(body.skills)) : body[field])
        const changed = await this.execute(`UPDATE dc_projects SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`, [...params, args.id])
        return changed ? ResponseHelper.success(event, { id: args.id }) : ResponseHelper.notFound(event, 'Project not found')
    }

    async updateImage(event, args) {
        const project = await this.fetchOne('SELECT img FROM dc_projects WHERE id = ?', [args.id])
        if (!project) return ResponseHelper.notFound(event, 'Project not found')

        const { files } = await RequestHelper.multipart(event)
        if (!files.image) return ResponseHelper.validationError(event, 'No image provided')
        if (!UploadHelper.isAcceptedImage(files.image))
            return ResponseHelper.validationError(event, 'Image must be a JPG, PNG, GIF, WEBP or AVIF file')

        const imagePath = await UploadHelper.saveImage(files.image)
        await this.execute('UPDATE dc_projects SET img = ? WHERE id = ?', [imagePath, args.id])
        await UploadHelper.removeImage(project.img)
        return ResponseHelper.success(event, { id: args.id, imagePath })
    }

    async delete(event, args) {
        const project = await this.fetchOne('SELECT img FROM dc_projects WHERE id = ?', [args.id])
        if (!project) return ResponseHelper.notFound(event, 'Project not found')

        await this.execute('DELETE FROM dc_projects WHERE id = ?', [args.id])
        await UploadHelper.removeImage(project.img)
        return ResponseHelper.success(event, { id: args.id })
    }
}
