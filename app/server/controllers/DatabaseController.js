import { backup, DatabaseSync } from 'node:sqlite'
import { readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/*
 * SQLite file of the site (DatabaseHelper.file()):
 *   GET  /api/database/setup        public: is the database ready (no personal data)
 *   GET  /api/database/download-db  the db.sqlite file
 *   GET  /api/database/export-sql   SQL dump (schema + INSERT)
 *   POST /api/database/replace-db   multipart "file": replaces the content by an uploaded db.sqlite
 */
const SQLITE_HEADER = 'SQLite format 3\0'

// SQL literal of a value, as in the previous sql.js export: NULL or a quoted string
const literal = value => (value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`)

// Problem of an uploaded file, or null when it is a valid database of this site
const checkUploadedDatabase = path => {
    const db = new DatabaseSync(path, { readOnly: true })
    try {
        if (db.prepare('PRAGMA quick_check').get()?.quick_check !== 'ok') return 'The uploaded database is corrupted'
        const users = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'dc_users'").get()
        return users ? null : 'The uploaded file is not a database of this site (dc_users table missing)'
    } finally {
        db.close()
    }
}

export default class DatabaseController extends Controller {
    static publicActions = ['setup']

    static routes = {
        setup: ['GET', '/setup'],
        download: ['GET', '/download-db'],
        exportSql: ['GET', '/export-sql'],
        replace: ['POST', '/replace-db'],
    }

    // Tables are created at startup by server/plugins/init-database.js; this only reports the state
    async setup(event) {
        const users = await this.fetchOne("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'dc_users'")
        const admin = users ? await this.fetchOne("SELECT id FROM dc_users WHERE id = 'user_admin' LIMIT 1") : null
        return ResponseHelper.success(event, { initialized: Boolean(users), adminExists: Boolean(admin) })
    }

    async download(event) {
        setResponseHeader(event, 'Content-Disposition', 'attachment; filename="db.sqlite"')
        setResponseHeader(event, 'Content-Type', 'application/x-sqlite3')
        return readFile(DatabaseHelper.file())
    }

    async exportSql(event) {
        const tables = await this.fetchAll("SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")
        let dump = 'BEGIN TRANSACTION;\n'

        for (const { name, sql } of tables) {
            dump += `${sql};\n`
            const columns = (await this.fetchAll(`PRAGMA table_info("${name}")`)).map(c => c.name)
            const columnList = columns.map(c => `"${c}"`).join(', ')
            for (const row of await this.fetchAll(`SELECT * FROM "${name}"`))
                dump += `INSERT INTO "${name}" (${columnList}) VALUES (${columns.map(c => literal(row[c])).join(', ')});\n`
        }

        dump += 'COMMIT;\n'
        setResponseHeader(event, 'Content-Disposition', 'attachment; filename="backup.sql"')
        setResponseHeader(event, 'Content-Type', 'application/sql')
        return dump
    }

    // The uploaded file is checked, then copied into the open database with the SQLite backup API:
    // the running server keeps working on the new content, no file is overwritten while it is open
    async replace(event) {
        const { files } = await RequestHelper.multipart(event)
        const file = Object.values(files)[0]
        if (!file) return ResponseHelper.validationError(event, 'No file uploaded')
        if (file.data.subarray(0, SQLITE_HEADER.length).toString('latin1') !== SQLITE_HEADER)
            return ResponseHelper.validationError(event, 'The uploaded file is not a SQLite database')

        const target = DatabaseHelper.file()
        const upload = join(dirname(target), `upload-${Date.now()}.sqlite`)
        await writeFile(upload, file.data)

        try {
            const problem = checkUploadedDatabase(upload)
            if (problem) return ResponseHelper.validationError(event, problem)

            const source = new DatabaseSync(upload, { readOnly: true })
            try {
                await backup(source, target)
            } finally {
                source.close()
            }
        } finally {
            await unlink(upload).catch(() => {})
        }

        // Same trigger as before: in development the .env change reloads the server
        setImmediate(() => EnvHelper.bumpReplaceTrigger().catch(error => console.error('Failed to update DB_REPLACE_TRIGGER:', error)))
        return ResponseHelper.success(event, { message: 'Database replaced successfully. Server restarting...' })
    }
}
