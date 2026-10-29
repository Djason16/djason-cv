import bcrypt from 'bcryptjs'
import { randomBytes } from 'node:crypto'
import { DatabaseHelper } from './DatabaseHelper.js'

/*
 * Admin sessions: a random id in the httpOnly "sid" cookie, the matching row in dc_sessions.
 * At most MAX_SESSIONS_PER_USER sessions per user (the oldest ones are removed), valid MAX_AGE seconds.
 */
const COOKIE_NAME = 'sid'
// 1 week
const MAX_AGE = 60 * 60 * 24 * 7
const MAX_SESSIONS_PER_USER = 3

// Secure cookie only over HTTPS (directly or behind the Apache proxy)
const isSecure = event =>
    getRequestHeader(event, 'x-forwarded-proto') === 'https' || Boolean(event.node.req.connection?.encrypted)

// Session cookie: not readable in JavaScript, HTTPS only on the live site
const cookieOptions = event => ({ httpOnly: true, sameSite: 'lax', path: '/', secure: isSecure(event) })

// End date of a new session
const expiry = () => new Date(Date.now() + MAX_AGE * 1000).toISOString()

// Deletes the sessions that are over
const removeExpired = () => DatabaseHelper.execute('DELETE FROM dc_sessions WHERE expires_at < ?', [new Date().toISOString()])

export const SessionHelper = {
    /** Opens a session for the user and sets the cookie. */
    async create(event, userId) {
        await removeExpired()

        // Keeps room for the new session: remove the oldest ones above the limit
        const sessions = await DatabaseHelper.fetchAll('SELECT id FROM dc_sessions WHERE user_id = ? ORDER BY created_at ASC', [userId])
        for (const session of sessions.slice(0, Math.max(0, sessions.length - MAX_SESSIONS_PER_USER + 1)))
            await DatabaseHelper.execute('DELETE FROM dc_sessions WHERE id = ?', [session.id])

        const sessionId = randomBytes(16).toString('hex')
        await DatabaseHelper.insert('INSERT INTO dc_sessions (id, user_id, expires_at) VALUES (?, ?, ?)', [sessionId, userId, expiry()])
        setCookie(event, COOKIE_NAME, sessionId, { ...cookieOptions(event), maxAge: MAX_AGE })
    },

    /** User id of the current session (its expiry is pushed back), or null. */
    async userId(event) {
        const sessionId = getCookie(event, COOKIE_NAME)
        if (!sessionId) return null

        await removeExpired()
        const session = await DatabaseHelper.fetchOne('SELECT user_id FROM dc_sessions WHERE id = ? LIMIT 1', [sessionId])
        if (!session) return null

        await DatabaseHelper.execute('UPDATE dc_sessions SET expires_at = ? WHERE id = ?', [expiry(), sessionId])
        return session.user_id
    },

    /** Closes the current session and removes the cookie. */
    async destroy(event) {
        const sessionId = getCookie(event, COOKIE_NAME)
        if (sessionId) await DatabaseHelper.execute('DELETE FROM dc_sessions WHERE id = ?', [sessionId])
        deleteCookie(event, COOKIE_NAME, cookieOptions(event))
    },

    /** Removes every session of a user (after a password change or reset). */
    destroyAll: userId => DatabaseHelper.execute('DELETE FROM dc_sessions WHERE user_id = ?', [userId]),

    hashPassword: password => bcrypt.hash(password, 10),
    verifyPassword: (password, hash) => bcrypt.compare(password, hash),
}
