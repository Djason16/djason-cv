import { parse, serialize } from 'cookie'
import { randomBytes } from 'crypto'

const SESSION_NAME = 'sid'
const MAX_AGE = 60 * 60 * 24 * 7 // 1 week in seconds

// Create a new session for a user and return a serialized cookie
export const createSession = async (userId, db) => {
  const sessionId = randomBytes(16).toString('hex')
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000).toISOString()

  await db.sql`
    INSERT INTO dc_sessions (id, user_id, expires_at)
    VALUES (${sessionId}, ${userId}, ${expiresAt})
  `

  return serialize(SESSION_NAME, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

// Retrieve user ID from session cookie if valid
export const getSessionUser = async (cookieHeader, db) => {
  if (!cookieHeader) return null
  const sessionId = parse(cookieHeader)[SESSION_NAME]
  if (!sessionId) return null

  const { rows } = await db.sql`
    SELECT user_id, expires_at FROM dc_sessions WHERE id=${sessionId} LIMIT 1
  `
  if (!rows.length || new Date(rows[0].expires_at) < new Date()) return null

  return rows[0].user_id
}

// Delete session based on cookie
export const deleteSession = async (cookieHeader, db) => {
  if (!cookieHeader) return
  const sessionId = parse(cookieHeader)[SESSION_NAME]
  if (!sessionId) return

  await db.sql`DELETE FROM dc_sessions WHERE id=${sessionId}`
}