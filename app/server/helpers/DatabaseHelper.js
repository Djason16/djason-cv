import { resolve } from 'node:path'

/*
 * Database access (DC Scaffold convention: https://github.com/Djason16/dc-scaffold, same four methods as every DC Scaffold back end).
 * The SQLite connection is the one of Nitro Database (nitro.database in nuxt.config.ts, node:sqlite),
 * the file is DB_FILE (default .data/db.sqlite, relative to the folder the server is started from).
 *
 *   await DatabaseHelper.fetchAll('SELECT * FROM dc_clients WHERE active = ?', [1])
 *   await DatabaseHelper.fetchOne('SELECT * FROM dc_clients WHERE id = ?', [id])
 *   await DatabaseHelper.insert('INSERT INTO dc_clients (id, email) VALUES (?, ?)', [id, email])
 *   await DatabaseHelper.execute('DELETE FROM dc_clients WHERE id = ?', [id])
 *
 * The "?" placeholders protect from SQL injection.
 */

// node:sqlite only accepts null, numbers, strings and buffers: booleans become 0/1, undefined becomes null
const toParams = params => params.map(value => {
    if (value === undefined) return null
    if (typeof value === 'boolean') return value ? 1 : 0
    return value
})

const statement = sql => useDatabase().prepare(sql)

export const DatabaseHelper = {
    /** All matching rows (empty array when none). */
    async fetchAll(sql, params = []) {
        return (await statement(sql).all(...toParams(params))) || []
    },

    /** First matching row, or null. */
    async fetchOne(sql, params = []) {
        const rows = await DatabaseHelper.fetchAll(sql, params)
        return rows[0] ?? null
    },

    /** Runs an INSERT and returns the new row id (tables of this project use UUIDs generated before the insert). */
    async insert(sql, params = []) {
        const result = await statement(sql).run(...toParams(params))
        return Number(result.lastInsertRowid ?? 0)
    },

    /** Runs an UPDATE / DELETE / CREATE and returns the number of affected rows. */
    async execute(sql, params = []) {
        const result = await statement(sql).run(...toParams(params))
        return Number(result.changes ?? 0)
    },

    /** New UUID for the primary keys of the dc_* tables. */
    uuid: () => crypto.randomUUID(),

    /** Absolute path of the SQLite file (download, export, replace). */
    file: () => resolve(useRuntimeConfig().dbFile),
}
