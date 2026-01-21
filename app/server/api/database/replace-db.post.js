import { readFile, writeFile } from 'fs/promises'
import { createError, readMultipartFormData } from 'h3'
import { resolve } from 'path'
import { getEnvFilePath } from '~/server/utils/env-utils/get-env-file-path'

export default defineEventHandler(async event => {
    const dbPath = resolve('./.data/db.sqlite')

    try {
        // Parse uploaded multipart file
        const files = await readMultipartFormData(event)
        const file = files.find(f => f.filename)
        if (!file) throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })

        // Overwrite SQLite database with uploaded file
        await writeFile(dbPath, file.data)

        const response = { success: true, message: 'Database replaced successfully. Server restarting...' }

        // Increment DB_REPLACE_TRIGGER in .env asynchronously to trigger server reload
        setImmediate(async () => {
            try {
                const envFilePath = getEnvFilePath()
                const content = await readFile(envFilePath, 'utf-8')
                const lines = content.split('\n')
                const updatedLines = []
                let triggerUpdated = false

                for (const line of lines) {
                    const trimmed = line.trim()
                    if (trimmed.startsWith('DB_REPLACE_TRIGGER=')) {
                        const current = parseInt(trimmed.split('=')[1]) || 0
                        updatedLines.push(`DB_REPLACE_TRIGGER=${current + 1}`)
                        triggerUpdated = true
                    } else {
                        updatedLines.push(line)
                    }
                }

                if (!triggerUpdated) updatedLines.push(`DB_REPLACE_TRIGGER=1`)

                await writeFile(envFilePath, updatedLines.join('\n'), 'utf-8')
                console.log('DB_REPLACE_TRIGGER incremented')
            } catch (err) {
                console.error('Failed to update DB_REPLACE_TRIGGER:', err)
            }
        })

        return response
    } catch (err) {
        console.error('DB replace error:', err)
        throw createError({ statusCode: 500, statusMessage: 'Failed to replace database' })
    }
})