import { parse, serialize } from 'cookie'
import { randomBytes } from 'crypto'

const SESSION_NAME = 'sid'
const MAX_AGE = 60 * 60 * 24 * 7 // 1 week
const MAX_SESSIONS_PER_USER = 3

// Helper to detect HTTPS context
const isSecureContext = (event) => {
  return event.node.req.headers['x-forwarded-proto'] === 'https' ||
    event.node.req.connection?.encrypted ||
    false
}

// Get consistent cookie options
export const getCookieOptions = (event) => ({
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: isSecureContext(event)
})

// Remove all expired sessions
const cleanupExpiredSessions = async (db) =>
  db.sql`DELETE FROM dc_sessions WHERE expires_at < CURRENT_TIMESTAMP`

// Create or refresh a session
export const createSession = async (userId, db, event) => {
  await cleanupExpiredSessions(db)

  // Delete oldest sessions if limit exceeded
  const { rows: sessions } = await db.sql`
        SELECT id FROM dc_sessions WHERE user_id=${userId} ORDER BY created_at ASC
    `
  while (sessions.length >= MAX_SESSIONS_PER_USER) {
    await db.sql`DELETE FROM dc_sessions WHERE id=${sessions.shift().id}`
  }

  const sessionId = randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000).toISOString()

  await db.sql`
        INSERT INTO dc_sessions (id, user_id, expires_at)
        VALUES (${sessionId}, ${userId}, ${expiresAt})
    `

  return serialize(SESSION_NAME, sessionId, {
    ...getCookieOptions(event),
    maxAge: MAX_AGE
  })
}

// Get user ID from session, refresh expiration if valid
export const getSessionUser = async (cookieHeader, db) => {
  await cleanupExpiredSessions(db)
  if (!cookieHeader) return null

  const sessionId = parse(cookieHeader)[SESSION_NAME]
  if (!sessionId) return null

  const { rows } = await db.sql`
        SELECT user_id, expires_at FROM dc_sessions WHERE id=${sessionId} LIMIT 1
    `
  if (!rows.length) return null

  const session = rows[0]
  if (new Date(session.expires_at) < new Date()) {
    await db.sql`DELETE FROM dc_sessions WHERE id=${sessionId}`
    return null
  }

  // Extend session expiration
  const newExpires = new Date(Date.now() + MAX_AGE * 1000).toISOString()
  await db.sql`UPDATE dc_sessions SET expires_at=${newExpires} WHERE id=${sessionId}`

  return session.user_id
}

// Delete session by cookie
export const deleteSession = async (cookieHeader, db) => {
  await cleanupExpiredSessions(db)
  if (!cookieHeader) return

  const sessionId = parse(cookieHeader)[SESSION_NAME]
  if (!sessionId) return

  await db.sql`DELETE FROM dc_sessions WHERE id=${sessionId}`
}