import { readBody } from 'h3'

export default defineEventHandler(async event => {
    const db = event.context.db
    const { id } = await readBody(event)

    // Validate mission ID
    if (!id) return { success: false, error: 'Mission ID is required' }

    try {
        await db.sql`DELETE FROM dc_missions WHERE id = ${id}`
        return { success: true }
    } catch (err) {
        console.error('Error deleting mission:', err)
        return { success: false, error: err.message || 'Failed to delete mission' }
    }
})
