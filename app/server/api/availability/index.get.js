import { useDatabase } from '#imports'
import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const db = event.context.db || useDatabase()

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

        // Fetch override status
        const { rows } = await db.sql`SELECT * FROM dc_availability_override LIMIT 1`

        if (!rows.length) {
            return {
                id: null,
                enabled: false,
                status: null,
                updatedAt: null
            }
        }

        const override = rows[0]

        return {
            id: override.id,
            enabled: Boolean(override.enabled),
            status: override.status,
            updatedAt: override.updated_at
        }
    } catch (err) {
        console.error(err)
        throw createError({ statusCode: 500, message: 'Error fetching availability status' })
    }
})
