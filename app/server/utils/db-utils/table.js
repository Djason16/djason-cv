// --- TABLE CREATION ---
export const createUsersTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`

export const createSessionsTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
  )
`

export const createClientsTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_clients (
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
    type TEXT CHECK(type IN ('individual','company','freelance')) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`

export const createServicesTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_services (
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
    FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE
  )
`

export const createMissionsTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_missions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    title TEXT,
    date DATE,
    duration REAL DEFAULT 0,
    quantity REAL DEFAULT 1,
    unit_price REAL DEFAULT 0,
    vat_applicable INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE,
    FOREIGN KEY(service_id) REFERENCES dc_services(id) ON DELETE CASCADE
  )
`

export const createQuotesTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_quotes (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    quote_number TEXT NOT NULL UNIQUE,
    total_ht REAL,
    total_vat REAL,
    total_ttc REAL,
    vat_applicable INTEGER DEFAULT 0,
    payment_terms TEXT,
    custom_start_number INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE
  )
`

export const createContractsTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_contracts (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    quote_id TEXT,
    content TEXT,
    duration TEXT,
    property_rights TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE,
    FOREIGN KEY(quote_id) REFERENCES dc_quotes(id) ON DELETE SET NULL
  )
`

export const createInvoicesTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_invoices (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    total_ht REAL,
    total_vat REAL,
    total_ttc REAL,
    vat_applicable INTEGER DEFAULT 0,
    payment_method TEXT,
    payment_due DATETIME,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    custom_start_number INTEGER,
    FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE
  )
`

export const createQuoteServicesTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_quote_services (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    unit_price REAL DEFAULT NULL,
    FOREIGN KEY(quote_id) REFERENCES dc_quotes(id) ON DELETE CASCADE,
    FOREIGN KEY(service_id) REFERENCES dc_services(id) ON DELETE CASCADE
  )
`

export const createInvoiceServicesTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_invoice_services (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    unit_price REAL DEFAULT NULL,
    FOREIGN KEY(invoice_id) REFERENCES dc_invoices(id) ON DELETE CASCADE,
    FOREIGN KEY(service_id) REFERENCES dc_services(id) ON DELETE CASCADE
  )
`

// --- SEED DEFAULT SERVICES ---
export const seedDefaultServices = async db => {
  const { rows } = await db.sql`SELECT COUNT(*) AS count FROM dc_services`
  if (rows[0].count) return

  const services = [
    { name: 'Video Editing (VFX)', description: 'Video editing with special effects for individuals.' },
    { name: 'Custom Web Development', description: 'Web development with maintenance included.' },
    { name: 'IT Repair & Consulting', description: 'Computer repair with technical advice.' },
    { name: 'Corporate Mission', description: 'Custom mission for companies or freelancers, includes date, duration, hours, quantity, unit price.' }
  ]

  for (const s of services)
    await db.sql`INSERT INTO dc_services (id, name, description) VALUES (${crypto.randomUUID()}, ${s.name}, ${s.description})`
}