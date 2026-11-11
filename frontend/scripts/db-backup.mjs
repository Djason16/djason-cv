// Saves the whole database in one SQL file: tables, then their rows (images of dc_uploads included).
//   npm run db:backup                         the local database (.env)
//   npm run db:backup -- --env .env.production   the online database, from a computer allowed by Infomaniak
// File: backups/<database>-<date>.sql at the root of the project (never sent to Git). Restore: npm run db:restore
import fs from 'node:fs'
import path from 'node:path'
import mysql from 'mysql2/promise'

const args = process.argv.slice(2)
const envFile = args[args.indexOf('--env') + 1] && args.includes('--env') ? args[args.indexOf('--env') + 1] : '.env'
if (fs.existsSync(envFile)) process.loadEnvFile(envFile)
const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER, DB_PASS, DB_NAME } = process.env
if (!DB_USER || !DB_NAME) { console.error(`DB_USER and DB_NAME are missing in ${envFile}`); process.exit(1) }

const db = await mysql.createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASS, database: DB_NAME, dateStrings: true })
const value = v => v === null ? 'NULL' : Buffer.isBuffer(v) ? `X'${v.toString('hex')}'` : typeof v === 'number' ? String(v) : db.escape(String(v))

const lines = [`-- Backup of ${DB_NAME}, ${new Date().toISOString()}`, 'SET NAMES utf8mb4;', 'SET FOREIGN_KEY_CHECKS = 0;', '']
const [tables] = await db.query('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"')
let rowsTotal = 0
for (const row of tables) {
    const table = Object.values(row)[0]
    const [[create]] = await db.query(`SHOW CREATE TABLE \`${table}\``)
    lines.push(`DROP TABLE IF EXISTS \`${table}\`;`, `${create['Create Table']};`)
    const [rows] = await db.query(`SELECT * FROM \`${table}\``)
    for (const r of rows) lines.push(`INSERT INTO \`${table}\` (${Object.keys(r).map(k => `\`${k}\``).join(', ')}) VALUES (${Object.values(r).map(value).join(', ')});`)
    rowsTotal += rows.length
    lines.push('')
}
lines.push('SET FOREIGN_KEY_CHECKS = 1;', '')
await db.end()

const dir = path.resolve('..', 'backups')
fs.mkdirSync(dir, { recursive: true })
const file = path.join(dir, `${DB_NAME}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.sql`)
fs.writeFileSync(file, lines.join('\n'))
console.log(`Saved: ${file} (${tables.length} tables, ${rowsTotal} rows)`)
