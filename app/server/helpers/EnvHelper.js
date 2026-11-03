import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/*
 * Environment files (DC Scaffold convention: https://github.com/Djason16/dc-scaffold): .env in development, .env.production in production.
 *
 * Plain Node.js module (no Nitro auto-import): nuxt.config.ts imports it too.
 */

// Keys accepted by the admin editor: letters, digits and underscores only
const KEY_PATTERN = /^[A-Z][A-Z0-9_]*$/

/** Absolute path of the .env file of the current mode. */
export const envFilePath = (mode = process.env.NODE_ENV, cwd = process.cwd()) =>
    resolve(cwd, mode === 'production' ? '.env.production' : '.env')

// KEY=value -> [key, value] without the surrounding quotes, null for comments and blank lines
const parseLine = line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return null

    const [key, ...rest] = trimmed.split('=')
    let value = rest.join('=').trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    return key.trim() ? [key.trim(), value] : null
}

// Value written back to the file: one line, quoted when it contains spaces
const formatValue = value => {
    const text = String(value ?? '').replace(/[\r\n]+/g, ' ')
    return text.includes(' ') ? `"${text}"` : text
}

export const EnvHelper = {
    /** Every KEY=value of the current .env file. */
    async read() {
        const content = await readFile(envFilePath(), 'utf-8')
        return Object.fromEntries(content.split('\n').map(parseLine).filter(Boolean))
    },

    /** Names of the keys the editor refuses (anything but A-Z, 0-9 and _). */
    invalidKeys: updates => Object.keys(updates).filter(key => !KEY_PATTERN.test(key)),

    /** Updates (or adds) keys, keeping comments, blank lines and the order of the file. */
    async write(updates) {
        const path = envFilePath()
        const lines = (await readFile(path, 'utf-8')).split('\n')
        const pending = new Map(Object.entries(updates))

        const updated = lines.map(line => {
            const entry = parseLine(line)
            if (!entry || !pending.has(entry[0])) return line
            const value = pending.get(entry[0])
            pending.delete(entry[0])
            return `${entry[0]}=${formatValue(value)}`
        })

        for (const [key, value] of pending) updated.push(`${key}=${formatValue(value)}`)
        await writeFile(path, updated.join('\n'), 'utf-8')
    },
}
