import crypto from 'crypto'
import { readBody } from 'h3'

export default defineEventHandler(async event => {
    const db = event.context.db

    // Parse request body
    const body = await readBody(event)

    // Generate a unique client ID
    const id = crypto.randomUUID()

    // Insert client into database, using null for optional fields
    await db.sql`
    INSERT INTO dc_clients (
      id, firstname, lastname, company_name, email, phone, address, postal_code, city, siret, type
    ) VALUES (
      ${id},
      ${body.firstname || null},
      ${body.lastname || null},
      ${body.company_name || null},
      ${body.email},
      ${body.phone || null},
      ${body.address || null},
      ${body.postal_code || null},
      ${body.city || null},
      ${body.siret || null},
      ${body.type}
    )
  `

    // Return success with the new client ID
    return { success: true, id }
})