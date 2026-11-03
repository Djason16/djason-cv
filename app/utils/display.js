// Small display helpers shared by the site and the admin tables

// Empty value shown as "-"
export const displayValue = value => value ?? '-'

// Time zone of the owner (admin → Agenda, dc_calendar_settings): the day of today and the hour of the tasks follow it.
// Europe/Paris until it is read (server: server/helpers/TimeZoneHelper.js; browser: plugins/site-settings.js)
let timeZone = 'Europe/Paris'
export const setTimeZone = zone => {
    try {
        if (zone) new Intl.DateTimeFormat('en-CA', { timeZone: zone })
        if (zone) timeZone = zone
    } catch { /* an unknown zone keeps the last one */ }
    return timeZone
}
export const currentTimeZone = () => timeZone

// The day of today in the time zone of the owner (YYYY-MM-DD): the date of the documents and their numbers. The universal time
// (toISOString) can still be the day before (or after): an invoice of 1 January would be dated 31 December
export const todayIso = () => new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())

// The hour of now (0-23) in the time zone of the owner
export const hourNow = () => Number(new Intl.DateTimeFormat('en-CA', { timeZone, hour: '2-digit', hourCycle: 'h23' }).format(new Date()))

// Letters of the longest word of some names (4 at least; a soft hyphen splits a word), set once on a grid of cards: every name of the grid gets the same size,
// the one where this word fits its card (card-grid.css)
export const longestWord = (...texts) => Math.max(4, ...texts.flat(Infinity).flatMap(text => String(text || '').split(/[\s\u00ad]+/)).map(word => word.length))

// Number of a list item on two digits, with an optional code before it: padIndex(0) -> "01", padIndex(2, 'PR') -> "PR-03"
export const padIndex = (index, code = '') => `${code ? `${code}-` : ''}${String(index + 1).padStart(2, '0')}`

/*
 * Two columns face to face (provider / client of a document): [{ key, from, to }] in their order.
 * What both sides have stays on the same line; what only one side has goes to the bottom of its column, with no empty line between.
 */
export const alignRows = rows => {
    const both = rows.filter(r => r.from && r.to)
    const fromOnly = rows.filter(r => r.from && !r.to).map(r => r.from)
    const toOnly = rows.filter(r => r.to && !r.from).map(r => r.to)
    const rest = Array.from({ length: Math.max(fromOnly.length, toOnly.length) }, (_, i) => ({ key: `extra-${i}`, from: fromOnly[i] || '', to: toOnly[i] || '' }))
    return [...both, ...rest]
}

/**
 * Size of the name of a party on a document (13 px), smaller for a long name so that it stays on one line:
 * a name on two lines would push its side down and leave a hole on the other side (the lines face each other).
 * @param {string} name
 * @returns {string} a CSS size, e.g. "11.4px"
 */
export const partyNameSize = name => `${Math.max(9.5, Math.min(13, 13 * 26 / Math.max(1, String(name || '').length))).toFixed(1)}px`
