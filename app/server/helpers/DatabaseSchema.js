import { DatabaseHelper } from './DatabaseHelper.js'
import { SessionHelper } from './SessionHelper.js'

/*
 * Tables of the project, created at startup by server/plugins/init-database.js.
 * The only place where a table is declared. Safe on an existing database:
 * CREATE TABLE IF NOT EXISTS adds a new table and never touches an existing one.
 * A change to an existing table needs its own ALTER TABLE (never drop or recreate a table with data).
 */
const TABLES = {
    dc_users: `
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_otp: `
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        code TEXT NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES dc_users(id) ON DELETE CASCADE`,
    dc_sessions: `
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL`,
    dc_clients: `
        id TEXT PRIMARY KEY,
        firstname TEXT,
        lastname TEXT,
        company_name TEXT,
        email TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        postal_code TEXT,
        city TEXT,
        siret TEXT,
        type TEXT CHECK(type IN ('individual', 'company', 'freelance', 'association')) NOT NULL,
        active INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_services: `
        id TEXT PRIMARY KEY,
        client_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        date_start DATETIME,
        date_end DATETIME,
        hours REAL,
        quantity REAL,
        unit_price REAL DEFAULT NULL,
        vat_applicable INTEGER DEFAULT 0,
        vat_rate REAL DEFAULT 20.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE`,
    dc_missions: `
        id TEXT PRIMARY KEY,
        client_id TEXT NOT NULL,
        service_id TEXT NOT NULL,
        title TEXT,
        date DATE,
        month_concerned TEXT,
        duration REAL DEFAULT 0,
        quantity REAL DEFAULT 1,
        unit_price REAL,
        tjm REAL DEFAULT NULL,
        vat_applicable INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE,
        FOREIGN KEY(service_id) REFERENCES dc_services(id) ON DELETE CASCADE`,
    dc_interest_rates: `
        id TEXT PRIMARY KEY,
        rate REAL NOT NULL,
        type TEXT CHECK(type IN ('professional', 'individual')) NOT NULL DEFAULT 'professional',
        valid_from DATETIME NOT NULL,
        valid_until DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_calendar_settings: `
        id TEXT PRIMARY KEY,
        user_id TEXT,
        timezone TEXT NOT NULL DEFAULT 'Europe/Paris',
        schedule TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES dc_users(id) ON DELETE CASCADE`,
    dc_unavailability: `
        id TEXT PRIMARY KEY,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_availability_override: `
        id TEXT PRIMARY KEY,
        enabled INTEGER NOT NULL DEFAULT 0,
        status TEXT CHECK(status IN ('available','busy','unavailable')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_projects: `
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        short_fr TEXT,
        short_en TEXT,
        img TEXT,
        link TEXT,
        skills TEXT,
        date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    // Failed attempts of login, OTP and security answer (server/helpers/RateLimitHelper.js)
    dc_rate_limits: `
        key TEXT PRIMARY KEY,
        attempts INTEGER NOT NULL DEFAULT 0,
        window_start DATETIME,
        locked_until DATETIME`,
}

// Default rows, inserted only when their table is empty
const SEEDS = {
    dc_services: async () => {
        const services = [
            { name: 'Video Editing (VFX)', description: 'Video editing with special effects for individuals.' },
            { name: 'Custom Web Development', description: 'Web development with maintenance included.' },
            { name: 'IT Repair & Consulting', description: 'Computer repair with technical advice.' },
            { name: 'Corporate Mission', description: 'Custom mission for companies or freelancers, includes date, duration, hours, quantity, unit price.' },
        ]
        for (const s of services)
            await DatabaseHelper.insert('INSERT INTO dc_services (id, name, description) VALUES (?, ?, ?)', [DatabaseHelper.uuid(), s.name, s.description])
    },
    dc_interest_rates: async () => {
        const rates = [
            // Professionals (B2B)
            { rate: 0.0667, type: 'professional', validFrom: '2026-01-01', validUntil: '2026-06-30' },
            { rate: 0.0665, type: 'professional', validFrom: '2025-07-01', validUntil: '2025-12-31' },
            // Individuals (B2C)
            { rate: 0.0354, type: 'individual', validFrom: '2026-01-01', validUntil: '2026-06-30' },
            { rate: 0.0368, type: 'individual', validFrom: '2025-07-01', validUntil: '2025-12-31' },
        ]
        for (const r of rates)
            await DatabaseHelper.insert('INSERT INTO dc_interest_rates (id, rate, type, valid_from, valid_until) VALUES (?, ?, ?, ?, ?)',
                [DatabaseHelper.uuid(), r.rate, r.type, r.validFrom, r.validUntil])
    },
    dc_calendar_settings: async () => {
        // Monday to Friday, 09:00 - 18:00
        const schedule = Object.fromEntries([1, 2, 3, 4, 5].map(day => [day, { start: '09:00', end: '18:00' }]))
        await DatabaseHelper.insert('INSERT INTO dc_calendar_settings (id, timezone, schedule) VALUES (?, ?, ?)',
            [DatabaseHelper.uuid(), 'Europe/London', JSON.stringify(schedule)])
    },
    dc_unavailability: () => DatabaseHelper.insert('INSERT INTO dc_unavailability (id, start_date, end_date) VALUES (?, ?, ?)',
        [DatabaseHelper.uuid(), '2099-01-10', '2099-01-20']),
    dc_availability_override: () => DatabaseHelper.insert('INSERT INTO dc_availability_override (id, enabled, status) VALUES (?, ?, ?)',
        [DatabaseHelper.uuid(), 0, 'unavailable']),
}

const isEmpty = async table => !(await DatabaseHelper.fetchOne(`SELECT 1 AS found FROM ${table} LIMIT 1`))

export const DatabaseSchema = {
    /** Creates the missing tables, then fills the empty ones. */
    async init() {
        for (const [table, columns] of Object.entries(TABLES))
            await DatabaseHelper.execute(`CREATE TABLE IF NOT EXISTS ${table} (${columns})`)

        for (const [table, seed] of Object.entries(SEEDS))
            if (await isEmpty(table)) await seed()
    },

    /**
     * Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME when it does not exist yet.
     * An existing admin is never modified (its password is changed from the admin page only).
     */
    async ensureAdmin({ adminEmail, adminPassword, adminName }) {
        const admin = await DatabaseHelper.fetchOne("SELECT email FROM dc_users WHERE id = 'user_admin' LIMIT 1")
        if (admin) return 'exists'
        if (!adminEmail || !adminPassword || !adminName) return 'missing-credentials'

        await DatabaseHelper.insert("INSERT INTO dc_users (id, email, password, name, role) VALUES ('user_admin', ?, ?, ?, 'admin')",
            [adminEmail, await SessionHelper.hashPassword(adminPassword), adminName])
        return 'created'
    },
}
