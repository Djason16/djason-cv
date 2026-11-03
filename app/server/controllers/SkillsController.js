/*
 * Skills added from the admin (shown on the home page with the ones of data/skills.js, and offered for the projects):
 *   GET    /api/skills          public list
 *   POST   /api/skills          JSON: name, group_id, description_fr, description_en
 *   PUT    /api/skills/{id}     JSON: any of name, group_id, description_fr, description_en
 *   DELETE /api/skills/{id}
 */
import { skillGroups } from '~/data/skills.js'

const EDITABLE = ['name', 'group_id', 'description_fr', 'description_en']
const GROUPS = skillGroups.map(group => group.id)
const clean = (field, value) => String(value ?? '').trim().slice(0, field === 'name' ? 120 : 1000)

export default class SkillsController extends Controller {
    static publicActions = ['getAll']

    async getAll(event) {
        const skills = await this.fetchAll('SELECT id, name, group_id, description_fr, description_en FROM dc_skills ORDER BY created_at')
        return ResponseHelper.success(event, { skills })
    }

    async create(event) {
        const body = (await this.body(event)) || {}
        const skill = Object.fromEntries(EDITABLE.map(field => [field, clean(field, body[field])]))
        if (!skill.name) return ResponseHelper.validationError(event, 'skillNameRequired')
        if (!GROUPS.includes(skill.group_id)) return ResponseHelper.validationError(event, 'skillGroupRequired')

        const id = DatabaseHelper.newId()
        await this.insert('INSERT INTO dc_skills (id, name, group_id, description_fr, description_en) VALUES (?, ?, ?, ?, ?)',
            [id, skill.name, skill.group_id, skill.description_fr, skill.description_en])
        return ResponseHelper.success(event, { skill: { id, ...skill } }, 201)
    }

    // Only the fields present in the body are changed
    async update(event, args) {
        const body = (await this.body(event)) || {}
        const fields = EDITABLE.filter(field => body[field] !== undefined)
        if (!fields.length) return ResponseHelper.validationError(event, 'Nothing to update')
        const values = fields.map(field => clean(field, body[field]))
        if (fields.includes('name') && !values[fields.indexOf('name')]) return ResponseHelper.validationError(event, 'skillNameRequired')
        if (fields.includes('group_id') && !GROUPS.includes(values[fields.indexOf('group_id')])) return ResponseHelper.validationError(event, 'skillGroupRequired')

        const changed = await this.execute(`UPDATE dc_skills SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`, [...values, args.id])
        return this.changed(event, changed, args.id, 'Skill not found')
    }

    async delete(event, args) {
        const changed = await this.execute('DELETE FROM dc_skills WHERE id = ?', [args.id])
        return this.changed(event, changed, args.id, 'Skill not found')
    }
}
