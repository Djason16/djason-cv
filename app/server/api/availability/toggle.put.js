import { useDatabase } from '#imports'
import { defineEventHandler, createError, readBody } from 'h3'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
    const db = event.context.db || useDatabase()
    const { enabled, status, id } = await readBody(event)

    if (enabled && !['available', 'busy', 'unavailable'].includes(status)) {
        throw createError({ statusCode: 400, message: 'Status must be available, busy, or unavailable' })
    }

    try {
        // Ensure table exists
        await db.sql`
            CREATE TABLE IF NOT EXISTS dc_availability_override (
                id TEXT PRIMARY KEY,
                enabled INTEGER NOT NULL DEFAULT 0,
                status TEXT CHECK(status IN ('available','busy','unavailable')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `

        const { rows } = await db.sql`SELECT * FROM dc_availability_override LIMIT 1`
        const enabledValue = enabled ? 1 : 0
        const finalStatus = status || rows[0]?.status || 'unavailable'

        if (!rows.length) {
            // Insert new record with unique ID
            const newId = crypto.randomUUID()
            await db.sql`
                INSERT INTO dc_availability_override (id, enabled, status)
                VALUES (${newId}, ${enabledValue}, ${finalStatus})
            `

            return {
                success: true,
                id: newId,
                enabled,
                status: finalStatus,
                message: 'Availability override created'
            }
        } else {
            // Update existing - uses the ID of the existing row
            const updateId = id || rows[0].id

            await db.sql`
                UPDATE dc_availability_override
                SET enabled = ${enabledValue},
                    status = ${finalStatus},
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ${updateId}
            `

            return {
                success: true,
                id: updateId,
                enabled,
                status: finalStatus,
                message: enabled ? 'Availability override activated' : 'Availability override deactivated'
            }
        }
    } catch (err) {
        console.error(err)
        throw createError({ statusCode: 500, message: 'Error toggling availability' })
    }
})