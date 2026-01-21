import { readFile } from 'fs/promises'
import { resolve } from 'path'
import initSqlJs from 'sql.js'

export default defineEventHandler(async event => {
    const dbPath = resolve('./.data/db.sqlite')

    try {
        // Initialize SQL.js with correct WASM file depending on environment
        const SQL = await initSqlJs({
            locateFile: () =>
                resolve(
                    process.env.NODE_ENV === 'production'
                        ? '.output/server/node_modules/sql.js/dist/sql-wasm.wasm'
                        : './node_modules/sql.js/dist/sql-wasm.wasm'
                )
        })

        const db = new SQL.Database(await readFile(dbPath))
        let dump = 'BEGIN TRANSACTION;\n'

        // Generate table schema and insert statements
        db.exec(`SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`)?.[0]?.values.forEach(([name, sql]) => {
            dump += `${sql};\n`
            const cols = db.exec(`PRAGMA table_info("${name}")`)?.[0]?.values.map(c => c[1]) || []
            const rows = db.exec(`SELECT * FROM "${name}"`)?.[0]?.values || []

            rows.forEach(r => {
                const colStr = cols.map(c => `"${c}"`).join(', ')
                const valStr = r.map(v => v === null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`).join(', ')
                dump += `INSERT INTO "${name}" (${colStr}) VALUES (${valStr});\n`
            })
        })

        dump += 'COMMIT;\n'

        // Send dump as downloadable SQL file
        setHeader(event, 'Content-Disposition', 'attachment; filename="backup.sql"')
        setHeader(event, 'Content-Type', 'application/sql')
        return dump

    } catch (err) {
        console.error('SQL export failed:', err)
        throw createError({ statusCode: 500, statusMessage: 'Unable to export SQL dump' })
    }
})