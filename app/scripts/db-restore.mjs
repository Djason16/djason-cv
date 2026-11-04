// Puts back a backup made by npm run db:backup: every table is replaced by the one of the file.
//   npm run db:restore -- ../backups/<file>.sql                       into the local database (.env)
//   npm run db:restore -- ../backups/<file>.sql --env .env.production into the online database (asks to type its name first)
import fs from 'node:fs'
import readline from 'node:readline/promises'
import mysql from 'mysql2/promise'

const args = process.argv.slice(2)
const file = args.find(a => a.endsWith('.sql'))
const envFile = args.includes('--env') ? args[args.indexOf('--env') + 1] : '.env'
if (!file || !fs.existsSync(file)) { console.error('Give the backup file: npm run db:restore -- ../backups/<file>.sql'); process.exit(1) }
if (fs.existsSync(envFile)) process.loadEnvFile(envFile)
const { DB_HOST = 'localhost', DB_PORT = '3306', DB_USER, DB_PASS, DB_NAME } = process.env

// Online: the name of the database must be typed, so it is never replaced by mistake
if (envFile !== '.env') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const answer = await rl.question(`Every table of "${DB_NAME}" on ${DB_HOST} will be replaced. Type its name to go on: `)
    rl.close()
    if (answer.trim() !== DB_NAME) { console.log('Nothing changed.'); process.exit(0) }
}

const db = await mysql.createConnection({ host: DB_HOST, port: Number(DB_PORT), user: DB_USER, password: DB_PASS, database: DB_NAME, multipleStatements: true })
await db.query(fs.readFileSync(file, 'utf8'))
const [tables] = await db.query('SHOW TABLES')
await db.end()
console.log(`Restored: ${file} into ${DB_NAME} (${tables.length} tables)`)
