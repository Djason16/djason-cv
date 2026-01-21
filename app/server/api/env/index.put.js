import { readFile, writeFile } from 'fs/promises'
import { createError, defineEventHandler, readBody } from 'h3'
import { getEnvFilePath } from '~/server/utils/env-utils/get-env-file-path'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)

        if (!body || typeof body !== 'object') {
            throw createError({ statusCode: 400, statusMessage: 'Invalid request body' })
        }

        // Send response immediately
        const response = { success: true, message: 'Environment variables updated successfully' }

        // Update env file after response is sent
        setImmediate(async () => {
            try {
                const envFilePath = getEnvFilePath()
                const content = await readFile(envFilePath, 'utf-8')
                const lines = content.split('\n')
                const updatedLines = []
                const keysToUpdate = new Set(Object.keys(body))
                const updatedKeys = new Set()

                // Parse existing lines and update values
                for (const line of lines) {
                    const trimmedLine = line.trim()

                    // Keep comments and empty lines as-is
                    if (!trimmedLine || trimmedLine.startsWith('#')) {
                        updatedLines.push(line)
                        continue
                    }

                    // Check if line contains a key=value pair
                    if (!trimmedLine.includes('=')) {
                        updatedLines.push(line)
                        continue
                    }

                    const [key] = trimmedLine.split('=')
                    const cleanKey = key.trim()

                    // If this key should be updated
                    if (keysToUpdate.has(cleanKey)) {
                        let newValue = body[cleanKey]

                        // Add quotes if value contains spaces
                        if (typeof newValue === 'string' && newValue.includes(' ')) {
                            newValue = `"${newValue}"`
                        }

                        updatedLines.push(`${cleanKey}=${newValue}`)
                        updatedKeys.add(cleanKey)
                    } else {
                        // Keep original line
                        updatedLines.push(line)
                    }
                }

                // Add new keys that don't exist yet
                for (const key of keysToUpdate) {
                    if (!updatedKeys.has(key)) {
                        let value = body[key]

                        // Add quotes if value contains spaces
                        if (typeof value === 'string' && value.includes(' ')) {
                            value = `"${value}"`
                        }

                        updatedLines.push(`${key}=${value}`)
                    }
                }

                // Write back to file
                await writeFile(envFilePath, updatedLines.join('\n'), 'utf-8')
            } catch (error) {
                console.error('Failed to update env file:', error)
            }
        })

        return response
    } catch (error) {
        console.error('Failed to update env file:', error)
        throw createError({ statusCode: 500, statusMessage: 'Failed to update env file' })
    }
})