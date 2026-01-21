import { readBody } from 'h3'

export default defineEventHandler(async event => {
    const { db } = event.context
    const body = await readBody(event)

    if (!body.id) return { success: false, error: 'Client ID is required' }

    try {
        await db.sql`DELETE FROM dc_clients WHERE id = ${body.id}` // remove client by ID
        return { success: true, deletedId: body.id }
    } catch (err) {
        console.error('Error deleting client:', err) // log any deletion errors
        return { success: false, error: 'Failed to delete client' }
    }
})