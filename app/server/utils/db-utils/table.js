// Create users table if it doesn't exist
export const createUsersTable = async db =>
  db.sql`
    CREATE TABLE IF NOT EXISTS dc_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `

// Create sessions table if it doesn't exist
export const createSessionsTable = async db =>
  db.sql`
    CREATE TABLE IF NOT EXISTS dc_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    )
  `