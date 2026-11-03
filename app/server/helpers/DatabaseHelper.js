import mysql from 'mysql2/promise'
import { AsyncLocalStorage } from 'node:async_hooks'

// Letters of the ids (newId)
const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz'

/*
 * Database access (DC Scaffold convention: https://github.com/Djason16/dc-scaffold, same four methods as every DC Scaffold back end).
 * MySQL through mysql2, with the DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASS values of the .env file.
 * Locally: the MySQL of docker-compose.yml (phpMyAdmin on http://localhost:8081). Online: the MySQL database of the host.
 *
 *   await DatabaseHelper.fetchAll('SELECT * FROM dc_clients WHERE active = ?', [1])
 *   await DatabaseHelper.fetchOne('SELECT * FROM dc_clients WHERE id = ?', [id])
 *   await DatabaseHelper.insert('INSERT INTO dc_clients (id, email) VALUES (?, ?)', [id, email])
 *   await DatabaseHelper.execute('DELETE FROM dc_clients WHERE id = ?', [id])
 *
 * The "?" placeholders protect from SQL injection.
 *
 * Every write (INSERT, UPDATE, DELETE, REPLACE) adds 1 to the version of its table (dc_versions): the browser asks for
 * these versions now and then (GET /api/versions, utils/liveData.js) and loads again only the lists that changed.
 */

// Connections opened on first use, then shared by every request
let pool = null
const getPool = () => {
    if (pool) return pool
    const { db } = useRuntimeConfig()
    if (!db.host) throw new Error('MySQL is not configured: set DB_HOST, DB_NAME, DB_USER and DB_PASS in the .env file')
    pool = mysql.createPool({
        host: db.host,
        port: Number(db.port || 3306),
        user: db.user,
        password: db.pass,
        database: db.name,
        charset: 'utf8mb4',
        // Dates come back as text ("2026-05-04", "2026-05-04 10:30:00"), like they are stored
        dateStrings: true,
        waitForConnections: true,
        connectionLimit: 10,
    })
    return pool
}

// Booleans become 0 / 1, undefined becomes NULL
const toParams = params => params.map(value => {
    if (value === undefined) return null
    if (typeof value === 'boolean') return value ? 1 : 0
    return value
})

// Runs a query; "query" (not "execute") so that a LIMIT or a number of any type works the same
const run = async (sql, params) => (await getPool().query(sql, toParams(params)))[0]

// Table written by a query ("UPDATE dc_clients SET ..." -> dc_clients), null for a read
const WRITE = /^\s*(?:INSERT(?:\s+IGNORE)?\s+INTO|REPLACE\s+INTO|UPDATE(?:\s+IGNORE)?|DELETE\s+FROM)\s+`?(\w+)`?/i
// Tables no page shows: no version
const UNTRACKED = new Set(['dc_versions', 'dc_sessions', 'dc_otp', 'dc_rate_limits', 'dc_users', 'dc_uploads'])

// Writes of the request in progress (DatabaseHelper.track): { table: { version, count } }
const requestWrites = new AsyncLocalStorage()

// The version of a written table goes up by 1 (atomic: two writes at once give two versions); never stops the write
const bump = async (sql, result) => {
    const table = WRITE.exec(sql)?.[1]
    if (!table || UNTRACKED.has(table) || !Number(result.affectedRows)) return
    try {
        const { insertId } = await run('INSERT INTO dc_versions (name, version) VALUES (?, 1) ON DUPLICATE KEY UPDATE version = LAST_INSERT_ID(version + 1)', [table])
        const writes = requestWrites.getStore()
        if (!writes) return
        const entry = (writes[table] ||= { version: 0, count: 0 })
        entry.version = Math.max(entry.version, Number(insertId) || 1)
        entry.count++
    } catch (error) {
        console.warn('[versions]', table, error.message)
    }
}
// A write: run, then its table gets a new version
const write = async (sql, params) => {
    const result = await run(sql, params)
    await bump(sql, result)
    return result
}

export const DatabaseHelper = {
    /** All matching rows (empty array when none). */
    async fetchAll(sql, params = []) {
        const rows = await run(sql, params)
        return Array.isArray(rows) ? rows : []
    },

    /** First matching row, or null. */
    async fetchOne(sql, params = []) {
        const rows = await DatabaseHelper.fetchAll(sql, params)
        return rows[0] ?? null
    },

    /** Runs an INSERT and returns the new row id (tables of this project use ids made before the insert: newId). */
    async insert(sql, params = []) {
        return Number((await write(sql, params)).insertId ?? 0)
    },

    /** Runs an UPDATE / DELETE / CREATE and returns the number of affected rows. */
    async execute(sql, params = []) {
        return Number((await write(sql, params)).affectedRows ?? 0)
    },

    /**
     * Runs a request and gives back what it wrote: { result, writes: { dc_clients: { version: 12, count: 1 } } }
     * (server/api/[...path].js sends it to the browser, which then knows these changes are its own).
     */
    async track(handler) {
        const writes = {}
        const result = await requestWrites.run(writes, handler)
        return { result, writes }
    },

    /**
     * New id for the primary keys of the dc_* tables: 10 small letters and figures picked at random ("k3x9a2m4q8"),
     * thousands of billions of them, never two the same in practice. Not a secret (the secrets are longer: pay_token, sessions).
     */
    newId: () => {
        const bytes = crypto.getRandomValues(new Uint8Array(10))
        // 252 = 7 × 36: every letter equally likely (a byte of 252 or more is drawn again)
        return Array.from(bytes, byte => {
            while (byte >= 252) byte = crypto.getRandomValues(new Uint8Array(1))[0]
            return ID_ALPHABET[byte % 36]
        }).join('')
    },
}
