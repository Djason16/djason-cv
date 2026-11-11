-- Database of djason-chery.dev: every table of the site, then its default rows (no personal data).
-- Made from frontend/server/helpers/DatabaseSchema.js: the site makes the same tables at its start, so this file is never required,
-- it only lets the database be ready before (Docker runs it on the first start of the local database; online: phpMyAdmin > Import).
-- Can be run again: a table that exists is kept, a default row never doubled.
-- Do not change by hand: change DatabaseSchema.js, then make this file again.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Admin account (made by the site from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME at its first start)
CREATE TABLE IF NOT EXISTS dc_users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Login codes sent by email
CREATE TABLE IF NOT EXISTS dc_otp (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    code VARCHAR(16) NOT NULL,
    expires_at VARCHAR(32) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES dc_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin sessions (cookie "sid")
CREATE TABLE IF NOT EXISTS dc_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at VARCHAR(32) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clients: individuals, companies, freelancers, associations
CREATE TABLE IF NOT EXISTS dc_clients (
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Services (a mission keeps one)
CREATE TABLE IF NOT EXISTS dc_services (
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
    FOREIGN KEY(client_id) REFERENCES dc_clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default services, only when the table is empty
INSERT INTO dc_services (id, name, description)
SELECT * FROM (
    SELECT 'service-video', 'Video Editing (VFX)', 'Video editing with special effects for individuals.'
    UNION ALL SELECT 'service-web', 'Custom Web Development', 'Web development with maintenance included.'
    UNION ALL SELECT 'service-repair', 'IT Repair & Consulting', 'Computer repair with technical advice.'
    UNION ALL SELECT 'service-mission', 'Corporate Mission', 'Custom mission for companies or freelancers, includes date, duration, hours, quantity, unit price.'
) AS defaults
WHERE NOT EXISTS (SELECT 1 FROM dc_services);

-- Missions of the clients: time spent (rate x duration x quantity) or a fixed price; invoice_id once billed
CREATE TABLE IF NOT EXISTS dc_missions (
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
    FOREIGN KEY(service_id) REFERENCES dc_services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legal interest rates by half-year (late penalties of the documents)
CREATE TABLE IF NOT EXISTS dc_interest_rates (
    id VARCHAR(64) PRIMARY KEY,
    rate DOUBLE NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'professional' CHECK(type IN ('professional', 'individual')),
    valid_from DATE NOT NULL,
    valid_until DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legal interest rates of the last half-years (admin > Rates to add the next ones), only when the table is empty
INSERT INTO dc_interest_rates (id, rate, type, valid_from, valid_until)
SELECT * FROM (
    SELECT 'rate-pro-2026-1', '0.0667', 'professional', '2026-01-01', '2026-06-30'
    UNION ALL SELECT 'rate-pro-2025-2', '0.0665', 'professional', '2025-07-01', '2025-12-31'
    UNION ALL SELECT 'rate-ind-2026-1', '0.0354', 'individual', '2026-01-01', '2026-06-30'
    UNION ALL SELECT 'rate-ind-2025-2', '0.0368', 'individual', '2025-07-01', '2025-12-31'
) AS defaults
WHERE NOT EXISTS (SELECT 1 FROM dc_interest_rates);

-- Agenda: time zone and hours of work
CREATE TABLE IF NOT EXISTS dc_calendar_settings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    timezone VARCHAR(64) NOT NULL DEFAULT 'Europe/Paris',
    schedule TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES dc_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Agenda: Monday to Friday, 09:00 - 18:00, Paris time, only when the table is empty
INSERT INTO dc_calendar_settings (id, timezone, schedule)
SELECT 'calendar-main', 'Europe/Paris', '{"1":{"start":"09:00","end":"18:00"},"2":{"start":"09:00","end":"18:00"},"3":{"start":"09:00","end":"18:00"},"4":{"start":"09:00","end":"18:00"},"5":{"start":"09:00","end":"18:00"}}' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM dc_calendar_settings);

-- Periods without availability
CREATE TABLE IF NOT EXISTS dc_unavailability (
    id VARCHAR(64) PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A period far away (none for now), only when the table is empty
INSERT INTO dc_unavailability (id, start_date, end_date)
SELECT 'unavailability-none', '2099-01-10', '2099-01-20' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM dc_unavailability);

-- Status of the site forced by the admin
CREATE TABLE IF NOT EXISTS dc_availability_override (
    id VARCHAR(64) PRIMARY KEY,
    enabled TINYINT NOT NULL DEFAULT 0,
    status VARCHAR(32) CHECK(status IN ('available', 'busy', 'unavailable')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Status not forced, only when the table is empty
INSERT INTO dc_availability_override (id, enabled, status)
SELECT 'override-main', '0', 'unavailable' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM dc_availability_override);

-- Projects of the home page
CREATE TABLE IF NOT EXISTS dc_projects (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_fr TEXT,
    short_en TEXT,
    img VARCHAR(255),
    link VARCHAR(512),
    skills TEXT,
    date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Skills added from the admin, shown on the home page after the ones of data/skills.js (group_id: id of a group of data/skills.js)
CREATE TABLE IF NOT EXISTS dc_skills (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    group_id VARCHAR(32) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Information about the site owner edited from the admin (identity, legal details, social links): server/helpers/SettingsHelper.js
CREATE TABLE IF NOT EXISTS dc_settings (
    `key` VARCHAR(64) PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Texts of the site changed from the admin (the defaults are in plugins/translations/): server/helpers/TextsHelper.js
CREATE TABLE IF NOT EXISTS dc_texts (
    lang VARCHAR(8) NOT NULL,
    `key` VARCHAR(128) NOT NULL,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (lang, `key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Images uploaded from the admin, stored in the database so a new deployment never loses them (server/helpers/UploadHelper.js)
CREATE TABLE IF NOT EXISTS dc_uploads (
    name VARCHAR(255) PRIMARY KEY,
    mime_type VARCHAR(64) NOT NULL,
    data MEDIUMBLOB NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Failed attempts of login, OTP and security answer (server/helpers/RateLimitHelper.js); "key" is a reserved word in MySQL
CREATE TABLE IF NOT EXISTS dc_rate_limits (
    `key` VARCHAR(255) PRIMARY KEY,
    attempts INT NOT NULL DEFAULT 0,
    window_start VARCHAR(32),
    locked_until VARCHAR(32)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Quotes, invoices and contracts of the admin (server/helpers/DocumentsHelper.js). A draft has no number; finalized, it gets the next number of its series (admin → Numbering, utils/numbering.js: DE-2026-0001 by default) and can no longer be changed. The client is copied in "client" when the document is finalized, so a later change of the client never changes a sent document. pay_token: secret of its payment link (page Pay me, server/helpers/PayLinkHelper.js), made the first time the link is asked. JSON texts: lines, payment_plan, deductions (deposits taken off a balance invoice), client, options (contract: service, interest rate).
CREATE TABLE IF NOT EXISTS dc_documents (
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
    `lines` MEDIUMTEXT,
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
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments received for an invoice (or a quote paid without an invoice yet)
CREATE TABLE IF NOT EXISTS dc_payments (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL,
    date DATE NOT NULL,
    amount DOUBLE NOT NULL,
    method VARCHAR(32) NOT NULL DEFAULT 'transfer',
    note VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(document_id) REFERENCES dc_documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Withdrawals sent online by consumers (page /withdrawal, art. L.221-21 of the French Consumer Code): kept as a proof
CREATE TABLE IF NOT EXISTS dc_withdrawals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    reference VARCHAR(255) NOT NULL,
    message TEXT,
    language VARCHAR(8) DEFAULT 'fr',
    ip VARCHAR(64),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
