import crypto from 'crypto'
import { readBody } from 'h3'

export default defineEventHandler(async event => {
  const db = event.context.db
  const body = await readBody(event)

  // Check required fields
  if (!body.clientId) return { success: false, error: 'Client ID is required' }
  if (!body.serviceId && !body.title) return { success: false, error: 'Service ID or mission title is required' }
  if (!body.date) return { success: false, error: 'Mission date is required' }

  // Generate a unique mission ID
  const id = crypto.randomUUID()
  const monthConcerned = body.date.slice(0, 7)

  // Insert mission into the database
  await db.sql`
    INSERT INTO dc_missions (
      id, client_id, service_id, title, date, month_concerned, duration, quantity, unit_price, tjm, vat_applicable
    ) VALUES (
      ${id},
      ${body.clientId},
      ${body.serviceId || null},
      ${body.title || null},
      ${body.date},
      ${monthConcerned},
      ${body.duration || 0},
      ${body.quantity || 1},
      ${body.unitPrice || null},
      ${body.tjm ?? null},
      ${body.tvaApplicable ? 1 : 0}
    )
  `

  return { success: true, id }
})