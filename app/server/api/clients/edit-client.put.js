import { readBody } from 'h3'

export default defineEventHandler(async event => {
    const db = event.context.db
    const body = await readBody(event)

    // Require client ID for update
    if (!body.id) return { success: false, error: 'Client ID is required' }

    try {
        // Update client with provided fields; optional fields default to null
        await db.sql`
      UPDATE dc_clients
      SET
        firstname = ${body.firstname || null},
        lastname = ${body.lastname || null},
        company_name = ${body.company_name || null},
        email = ${body.email || null},
        phone = ${body.phone || null},
        address = ${body.address || null},
        postal_code = ${body.postal_code || null},
        city = ${body.city || null},
        siret = ${body.siret || null},
        type = ${body.type || null}
      WHERE id = ${body.id}
    `

        return { success: true, id: body.id }
    } catch (err) {
        console.error('Error updating client:', err)
        return { success: false, error: 'Failed to update client' }
    }
})
