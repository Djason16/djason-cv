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

export const createInterestRatesTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_interest_rates (
    id TEXT PRIMARY KEY,
    rate REAL NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`

export const createCalendarSettingsTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_calendar_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    timezone TEXT NOT NULL DEFAULT 'Europe/Paris',
    schedule TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES dc_users(id) ON DELETE CASCADE
  )
`

export const createUnavailabilityTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_unavailability (
    id TEXT PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`

export const createAvailabilityOverrideTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_availability_override (
    id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    status TEXT CHECK(status IN ('available','busy','unavailable')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`

export const createProjectsTable = async db => db.sql`
  CREATE TABLE IF NOT EXISTS dc_projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_fr TEXT,
    short_en TEXT,
    img TEXT,
    link TEXT,
    skills TEXT,
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

// --- SEED INTEREST RATES ---
export const seedInterestRates = async db => {
  const { rows } = await db.sql`SELECT COUNT(*) AS count FROM dc_interest_rates`
  if (rows[0].count) return

  const rates = [
    { rate: 0.0667, validFrom: '2026-01-01', validUntil: '2026-06-30' },
    { rate: 0.0665, validFrom: '2025-07-01', validUntil: '2025-12-31' }
  ]

  for (const r of rates) {
    await db.sql`
      INSERT INTO dc_interest_rates (id, rate, valid_from, valid_until)
      VALUES (${crypto.randomUUID()}, ${r.rate}, ${r.validFrom}, ${r.validUntil})
    `
  }
}

// --- SEED CALENDAR SETTINGS ---
export const seedCalendarSettings = async db => {
  const { rows } = await db.sql`SELECT COUNT(*) AS count FROM dc_calendar_settings`
  if (rows[0].count) return

  const defaultSchedule = JSON.stringify({
    1: { start: '09:00', end: '18:00' }, // Monday
    2: { start: '09:00', end: '18:00' }, // Tuesday
    3: { start: '09:00', end: '18:00' }, // Wednesday
    4: { start: '09:00', end: '18:00' }, // Thursday
    5: { start: '09:00', end: '18:00' }  // Friday
  })

  await db.sql`
    INSERT INTO dc_calendar_settings (id, timezone, schedule)
    VALUES (
      ${crypto.randomUUID()},
      'Europe/London',
      ${defaultSchedule}
    )
  `
}

// --- SEED UNAVAILABILITY ---
export const seedUnavailability = async db => {
  const { rows } = await db.sql`SELECT COUNT(*) AS count FROM dc_unavailability`
  if (rows[0].count) return

  await db.sql`
    INSERT INTO dc_unavailability (id, start_date, end_date)
    VALUES (
      ${crypto.randomUUID()},
      '2099-01-10',
      '2099-01-20'
    )
  `
}

// --- SEED AVAILABILITY OVERRIDE ---
export const seedAvailabilityOverride = async db => {
  const { rows } = await db.sql`SELECT COUNT(*) AS count FROM dc_availability_override`
  if (rows[0].count) return

  await db.sql`
    INSERT INTO dc_availability_override (id, enabled, status)
    VALUES (
      ${crypto.randomUUID()},
      0,
      'unavailable'
    )
  `
}