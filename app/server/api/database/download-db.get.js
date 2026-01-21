import { readFile } from 'fs/promises'
import { createError, setHeader } from 'h3'
import { resolve } from 'path'

export default defineEventHandler(async event => {
    const dbPath = resolve('./.data/db.sqlite') // Resolve DB file path

    try {
        const file = await readFile(dbPath) // Read database file
        setHeader(event, 'Content-Disposition', 'attachment; filename="db.sqlite"') // Prompt download
        setHeader(event, 'Content-Type', 'application/x-sqlite3') // Correct MIME type
        return file
    } catch (err) {
        console.error('DB download error:', err)
        throw createError({ statusCode: 500, statusMessage: 'Failed to download database' })
    }
})