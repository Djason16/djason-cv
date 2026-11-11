import { DatabaseHelper } from '../utils/DatabaseHelper'
import { SessionHelper } from './SessionHelper'

/*
 * Tables of the project (MySQL), created at startup by server/plugins/init-database.js.
 * The only place where a table is declared. Safe on an existing database:
 * CREATE TABLE IF NOT EXISTS adds a new table and never touches an existing one.
 * A change to an existing table needs its own ALTER TABLE (never drop or recreate a table with data).
 *
 * Ids: 10 random letters and figures (DatabaseHelper.newId; VARCHAR(64), the older UUIDs still fit). Moments written by the code (expiry of a session, of a code, of a lock)
 * are ISO texts (VARCHAR(32)), compared as text like before; dates picked by the admin are DATE.
 */
const TABLES = {
    // Version of each table, +1 at every write (DatabaseHelper): the browser loads again only what changed (/api/versions)
    dc_versions: `
        name VARCHAR(64) PRIMARY KEY,
        version BIGINT NOT NULL DEFAULT 0`,
    dc_users: `
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(32) DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_otp: `
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        code VARCHAR(16) NOT NULL,
        expires_at VARCHAR(32) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES dc_users(id) ON DELETE CASCADE`,
    dc_sessions: `
        id VARCHAR(128) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at VARCHAR(32) NOT NULL`,
    dc_clients: `
        id VARCHAR(64) PRIMARY KEY,
        firstname VARCHAR(255),
        lastname VARCHAR(255),
        company_name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(64),
        address TEXT,
        postal_code VARCHAR(32),
        city VARCHAR(255),
        siret VARCHAR(32),
        type VARCHAR(32) NOT NULL CHECK(type IN ('individual', 'company', 'freelance', 'association')),
        active TINYINT NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_services: `
        id VARCHAR(64) PRIMARY KEY,
        client_id VARCHAR(64),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        date_start DATETIME,
        date_end DATETIME,
        hours DOUBLE,
        quantity DOUBLE,
        unit_price DOUBLE DEFAULT NULL,
        vat_applicable TINYINT DEFAULT 0,
        vat_rate DOUBLE DEFAULT 20.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE`,
    dc_missions: `
        id VARCHAR(64) PRIMARY KEY,
        client_id VARCHAR(64) NOT NULL,
        service_id VARCHAR(64) NOT NULL,
        title VARCHAR(255),
        description TEXT,
        date DATE,
        month_concerned VARCHAR(7),
        duration DOUBLE DEFAULT 0,
        quantity DOUBLE DEFAULT 1,
        unit_price DOUBLE,
        tjm DOUBLE DEFAULT NULL,
        vat_applicable TINYINT DEFAULT 0,
        invoice_id VARCHAR(64),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE,
        FOREIGN KEY(service_id) REFERENCES dc_services(id) ON DELETE CASCADE`,
    dc_interest_rates: `
        id VARCHAR(64) PRIMARY KEY,
        rate DOUBLE NOT NULL,
        type VARCHAR(32) NOT NULL DEFAULT 'professional' CHECK(type IN ('professional', 'individual')),
        valid_from DATE NOT NULL,
        valid_until DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_calendar_settings: `
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64),
        timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/Paris',
        schedule TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES dc_users(id) ON DELETE CASCADE`,
    dc_unavailability: `
        id VARCHAR(64) PRIMARY KEY,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_availability_override: `
        id VARCHAR(64) PRIMARY KEY,
        enabled TINYINT NOT NULL DEFAULT 0,
        status VARCHAR(32) CHECK(status IN ('available', 'busy', 'unavailable')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    dc_projects: `
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        short_fr TEXT,
        short_en TEXT,
        img VARCHAR(255),
        link VARCHAR(512),
        skills TEXT,
        date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    // Skills added from the admin, shown on the home page after the ones of data/skills.js (group_id: id of a group of data/skills.js)
    dc_skills: `
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        group_id VARCHAR(32) NOT NULL,
        description_fr TEXT,
        description_en TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    // Information about the site owner edited from the admin (identity, legal details, social links): server/helpers/SettingsHelper.js
    dc_settings: `
        \`key\` VARCHAR(64) PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    // Texts of the site changed from the admin (the defaults are in plugins/translations/): server/helpers/TextsHelper.js
    dc_texts: `
        lang VARCHAR(8) NOT NULL,
        \`key\` VARCHAR(128) NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (lang, \`key\`)`,
    // Images uploaded from the admin, stored in the database so a new deployment never loses them (server/helpers/UploadHelper.js)
    dc_uploads: `
        name VARCHAR(255) PRIMARY KEY,
        mime_type VARCHAR(64) NOT NULL,
        data MEDIUMBLOB NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
    // Failed attempts of login, OTP and security answer (server/helpers/RateLimitHelper.js); "key" is a reserved word in MySQL
    dc_rate_limits: `
        \`key\` VARCHAR(255) PRIMARY KEY,
        attempts INT NOT NULL DEFAULT 0,
        window_start VARCHAR(32),
        locked_until VARCHAR(32)`,
    /*
     * Quotes, invoices and contracts of the admin (server/helpers/DocumentsHelper.js). A draft has no number; finalized, it gets the
     * next number of its series (admin → Numbering, utils/numbering.js: DE-2026-0001 by default) and can no longer be changed. The client is copied in "client" when the
     * document is finalized, so a later change of the client never changes a sent document.
     * pay_token: secret of its payment link (page Pay me, server/helpers/PayLinkHelper.js), made the first time the link is asked.
     * JSON texts: lines, payment_plan, deductions (deposits taken off a balance invoice), client, options (contract: service, interest rate).
     */
    dc_documents: `
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(16) NOT NULL CHECK(type IN ('quote', 'invoice', 'contract')),
        kind VARCHAR(16) NOT NULL DEFAULT 'standard' CHECK(kind IN ('standard', 'deposit', 'installment', 'balance')),
        number VARCHAR(32) UNIQUE,
        status VARCHAR(16) NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'final', 'accepted', 'refused', 'cancelled')),
        client_id VARCHAR(64),
        client TEXT,
        quote_id VARCHAR(64),
        step_key VARCHAR(32),
        title VARCHAR(255),
        issue_date DATE,
        due_date DATE,
        validity_days INT DEFAULT 30,
        currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
        \`lines\` MEDIUMTEXT,
        discount_type VARCHAR(8),
        discount_value DOUBLE DEFAULT 0,
        payment_plan TEXT,
        deductions TEXT,
        notes TEXT,
        options TEXT,
        pay_token VARCHAR(64) UNIQUE,
        total_ht DOUBLE DEFAULT 0,
        total_tva DOUBLE DEFAULT 0,
        total_ttc DOUBLE DEFAULT 0,
        net_to_pay DOUBLE DEFAULT 0,
        finalized_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    // Payments received for an invoice (or a quote paid without an invoice yet)
    dc_payments: `
        id VARCHAR(64) PRIMARY KEY,
        document_id VARCHAR(64) NOT NULL,
        date DATE NOT NULL,
        amount DOUBLE NOT NULL,
        method VARCHAR(32) NOT NULL DEFAULT 'transfer',
        note VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(document_id) REFERENCES dc_documents(id) ON DELETE CASCADE`,
    // Withdrawals sent online by consumers (page /withdrawal, art. L.221-21 of the French Consumer Code): kept as a proof
    dc_withdrawals: `
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        reference VARCHAR(255) NOT NULL,
        message TEXT,
        language VARCHAR(8) DEFAULT 'fr',
        ip VARCHAR(64),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP`,
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
            await DatabaseHelper.insert('INSERT INTO dc_services (id, name, description) VALUES (?, ?, ?)', [DatabaseHelper.newId(), s.name, s.description])
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
                [DatabaseHelper.newId(), r.rate, r.type, r.validFrom, r.validUntil])
    },
    dc_calendar_settings: async () => {
        // Monday to Friday, 09:00 - 18:00
        const schedule = Object.fromEntries([1, 2, 3, 4, 5].map(day => [day, { start: '09:00', end: '18:00' }]))
        await DatabaseHelper.insert('INSERT INTO dc_calendar_settings (id, timezone, schedule) VALUES (?, ?, ?)',
            [DatabaseHelper.newId(), 'Europe/London', JSON.stringify(schedule)])
    },
    dc_unavailability: () => DatabaseHelper.insert('INSERT INTO dc_unavailability (id, start_date, end_date) VALUES (?, ?, ?)',
        [DatabaseHelper.newId(), '2099-01-10', '2099-01-20']),
    dc_availability_override: () => DatabaseHelper.insert('INSERT INTO dc_availability_override (id, enabled, status) VALUES (?, ?, ?)',
        [DatabaseHelper.newId(), 0, 'unavailable']),
}

/*
 * Changes of tables made before their current version (safe to run at every start: each one checks first).
 *   dc_documents: the contracts (a new type and the options column), the payment links (pay_token)
 *   dc_missions: the invoice that billed a mission (invoice_id), its description
 */
const hasColumn = async (table: string, column: string) => Boolean(await DatabaseHelper.fetchOne(
    'SELECT 1 AS found FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?', [table, column]))

const migrate = async () => {
    if (!(await hasColumn('dc_documents', 'options'))) await DatabaseHelper.execute('ALTER TABLE dc_documents ADD COLUMN options TEXT')
    if (!(await hasColumn('dc_documents', 'pay_token'))) await DatabaseHelper.execute('ALTER TABLE dc_documents ADD COLUMN pay_token VARCHAR(64) UNIQUE')
    if (!(await hasColumn('dc_missions', 'invoice_id'))) await DatabaseHelper.execute('ALTER TABLE dc_missions ADD COLUMN invoice_id VARCHAR(64)')
    if (!(await hasColumn('dc_missions', 'description'))) await DatabaseHelper.execute('ALTER TABLE dc_missions ADD COLUMN description TEXT AFTER title')

    const checks = await DatabaseHelper.fetchAll(`
        SELECT cc.CONSTRAINT_NAME AS name, cc.CHECK_CLAUSE AS clause FROM information_schema.CHECK_CONSTRAINTS cc
        JOIN information_schema.TABLE_CONSTRAINTS tc ON tc.CONSTRAINT_SCHEMA = cc.CONSTRAINT_SCHEMA AND tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
        WHERE tc.TABLE_SCHEMA = DATABASE() AND tc.TABLE_NAME = 'dc_documents' AND tc.CONSTRAINT_TYPE = 'CHECK'`)
    for (const check of checks) {
        if (!check.clause.includes("'invoice'") || check.clause.includes("'contract'") || check.clause.includes("'deposit'")) continue
        await DatabaseHelper.execute(`ALTER TABLE dc_documents DROP CHECK \`${check.name}\``)
        await DatabaseHelper.execute("ALTER TABLE dc_documents ADD CHECK (type IN ('quote', 'invoice', 'contract'))")
    }
}

// Default rows are only added to an empty table
const isEmpty = async (table: string) => !(await DatabaseHelper.fetchOne(`SELECT 1 AS found FROM ${table} LIMIT 1`))

export const DatabaseSchema = {
    /** Creates the missing tables, then fills the empty ones. */
    async init() {
        for (const [table, columns] of Object.entries(TABLES))
            await DatabaseHelper.execute(`CREATE TABLE IF NOT EXISTS ${table} (${columns}) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)

        for (const [table, seed] of Object.entries(SEEDS))
            if (await isEmpty(table)) await seed()

        await migrate()
    },

    /**
     * Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME when it does not exist yet.
     * An existing admin is never modified (its password is changed from the admin page only).
     */
    async ensureAdmin({ adminEmail, adminPassword, adminName }: { adminEmail: string, adminPassword: string, adminName: string }) {
        const admin = await DatabaseHelper.fetchOne("SELECT email FROM dc_users WHERE id = 'user_admin' LIMIT 1")
        if (admin) return 'exists'
        if (!adminEmail || !adminPassword || !adminName) return 'missing-credentials'

        await DatabaseHelper.insert("INSERT INTO dc_users (id, email, password, name, role) VALUES ('user_admin', ?, ?, ?, 'admin')",
            [adminEmail, await SessionHelper.hashPassword(adminPassword), adminName])
        return 'created'
    },
}
