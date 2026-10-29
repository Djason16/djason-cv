import { DatabaseHelper } from './DatabaseHelper.js'

/*
 * Limits failed attempts (password, OTP code, security answer), stored in dc_rate_limits:
 * the counters survive a page reload, a new session and a server restart.
 *
 *   const limit = await RateLimitHelper.check(['otp:user_admin', `otp-ip:${ip}`])
 *   if (limit.locked) return ResponseHelper.tooManyRequests(event, 'tooManyAttempts', limit.retryAfter)
 *   ...wrong code: await RateLimitHelper.fail(keys, RateLimitHelper.OTP)
 *   ...right code: await RateLimitHelper.reset(keys)
 */

const now = () => Date.now()

// Failed attempts of one key (account or IP)
const read = key => DatabaseHelper.fetchOne('SELECT * FROM dc_rate_limits WHERE key = ? LIMIT 1', [key])

export const RateLimitHelper = {
    // max failures within windowSeconds, then locked for lockSeconds
    LOGIN: { max: 5, windowSeconds: 15 * 60, lockSeconds: 15 * 60 },
    OTP: { max: 5, windowSeconds: 10 * 60, lockSeconds: 15 * 60 },
    SECURITY_ANSWER: { max: 3, windowSeconds: 60 * 60, lockSeconds: 60 * 60 },

    /** Locked when any of the keys is locked; retryAfter in seconds. */
    async check(keys) {
        let retryAfter = 0
        for (const key of keys) {
            const row = await read(key)
            const lockedUntil = row?.locked_until ? Date.parse(row.locked_until) : 0
            if (lockedUntil > now()) retryAfter = Math.max(retryAfter, Math.ceil((lockedUntil - now()) / 1000))
        }
        return { locked: retryAfter > 0, retryAfter }
    },

    /** Counts one failure on every key; returns true when this failure locks one of them. */
    async fail(keys, { max, windowSeconds, lockSeconds }) {
        let locked = false
        for (const key of keys) {
            const row = await read(key)
            const windowStart = row?.window_start ? Date.parse(row.window_start) : 0
            const inWindow = windowStart && now() - windowStart < windowSeconds * 1000
            const attempts = inWindow ? row.attempts + 1 : 1
            const lockedUntil = attempts >= max ? new Date(now() + lockSeconds * 1000).toISOString() : null
            const start = inWindow ? row.window_start : new Date().toISOString()

            await DatabaseHelper.execute(
                `INSERT INTO dc_rate_limits (key, attempts, window_start, locked_until) VALUES (?, ?, ?, ?)
                 ON CONFLICT(key) DO UPDATE SET attempts = excluded.attempts, window_start = excluded.window_start, locked_until = excluded.locked_until`,
                [key, lockedUntil ? 0 : attempts, lockedUntil ? new Date().toISOString() : start, lockedUntil]
            )
            locked ||= Boolean(lockedUntil)
        }
        return locked
    },

    /** Clears the counters after a success. */
    async reset(keys) {
        for (const key of keys) await DatabaseHelper.execute('DELETE FROM dc_rate_limits WHERE key = ?', [key])
    },
}
