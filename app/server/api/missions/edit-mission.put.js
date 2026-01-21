import { readBody } from 'h3'

export default defineEventHandler(async event => {
  const db = event.context.db
  const body = await readBody(event)
  const { id, clientId, serviceId, title, date, duration, quantity, unitPrice, tvaApplicable } = body

  // Basic validation
  if (!id) return { success: false, error: 'Mission ID is required' }
  if (!clientId) return { success: false, error: 'Client ID is required' }
  if (!serviceId && !title) return { success: false, error: 'Service ID or mission title is required' }
  if (!date) return { success: false, error: 'Mission date is required' }

  try {
    await db.sql`
      UPDATE dc_missions SET
        client_id = ${clientId},
        service_id = ${serviceId || null},
        title = ${title || null},
        date = ${date},
        duration = ${duration || 0},
        quantity = ${quantity || 1},
        unit_price = ${unitPrice || null},
        vat_applicable = ${tvaApplicable ? 1 : 0}
      WHERE id = ${id}
    `
    return { success: true }
  } catch (err) {
    console.error('Error updating mission:', err)
    return { success: false, error: err.message || 'Failed to update mission' }
  }
})
