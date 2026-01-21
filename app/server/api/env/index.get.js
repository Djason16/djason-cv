import { readFile } from 'fs/promises'
import { createError, defineEventHandler } from 'h3'
import { getEnvFilePath } from '~/server/utils/env-utils/get-env-file-path'

export default defineEventHandler(async () => {
    try {
        const content = await readFile(getEnvFilePath(), 'utf-8')
        const result = {}

        for (const line of content.split('\n')) {
            // Ignore blank lines, comments, and lines without '='
            const trimmedLine = line.trim()
            if (!trimmedLine || trimmedLine.startsWith('#') || !trimmedLine.includes('=')) {
                continue
            }

            const [key, ...rest] = trimmedLine.split('=')
            const cleanKey = key.trim()

            // Ignore if the key is empty
            if (!cleanKey) continue

            let cleanValue = rest.join('=').trim()

            // Remove the quotation marks around the value if present
            if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
                (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
                cleanValue = cleanValue.slice(1, -1)
            }

            result[cleanKey] = cleanValue
        }

        return result
    } catch {
        throw createError({ statusCode: 500, statusMessage: 'Failed to read env file' })
    }
})