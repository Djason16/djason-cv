/*
 * Numbers of the quotes, invoices and contracts, shared by the browser (admin → Numbering, the editor) and the server
 * (server/helpers/DocumentsHelper.js). Set from the admin, stored in dc_settings (key "numbering", JSON):
 *   { quote: { prefix: 'DE', format: '{P}-{YYYY}-{N}', digits: 4, startFrom: '' }, invoice: {...}, contract: {...} }
 *
 * Format: {P} prefix, {YYYY} year, {YY} short year, {MM} month, {N} counter (with "digits" figures).
 * The counter starts again at 1 each time the rest of the number changes: each year with {YYYY}, each month with {MM},
 * never without a date. startFrom: a number to go on from (CO-2026-0007: the next contract of 2026 is at least 0007).
 *
 *   nextNumber('invoice', '2026-11-03', settings.numbering, ['FA-2026-0006'])   'FA-2026-0007'
 */

export const NUMBERING_TYPES = ['quote', 'invoice', 'contract']

export const DEFAULT_NUMBERING = {
    quote: { prefix: 'DE', format: '{P}-{YYYY}-{N}', digits: 4, startFrom: '' },
    invoice: { prefix: 'FA', format: '{P}-{YYYY}-{N}', digits: 4, startFrom: '' },
    contract: { prefix: 'CO', format: '{P}-{YYYY}-{N}', digits: 4, startFrom: '' },
}

// Formats offered in the admin (any other one with {N} works too)
export const NUMBER_FORMATS = ['{P}-{YYYY}-{N}', '{P}{YYYY}-{N}', '{P}{YYYY}{N}', '{P}-{YY}-{N}', '{P}-{YYYY}{MM}-{N}', '{P}{YY}{MM}{N}', '{P}-{N}', '{P}{N}']

const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const clean = text => String(text ?? '').trim()

/** Settings of one type, completed by the defaults (a broken value falls back to the default). */
export const numberingOf = (type, numbering) => {
    let saved = numbering
    if (typeof saved === 'string') {
        try { saved = JSON.parse(saved || '{}') } catch { saved = {} }
    }
    const value = { ...DEFAULT_NUMBERING[type], ...(saved?.[type] || {}) }
    const digits = Math.min(8, Math.max(1, Number(value.digits) || 4))
    const format = clean(value.format).includes('{N}') ? clean(value.format) : DEFAULT_NUMBERING[type].format
    return { prefix: clean(value.prefix).toUpperCase().replace(/[^A-Z0-9_]/g, ''), format, digits, startFrom: clean(value.startFrom).toUpperCase() }
}

// The number without its counter, for a date: 'FA-2026-'... and what comes after the counter
const parts = (settings, date) => {
    const day = String(date || new Date().toISOString()).slice(0, 10)
    const filled = settings.format
        .replaceAll('{P}', settings.prefix)
        .replaceAll('{YYYY}', day.slice(0, 4))
        .replaceAll('{YY}', day.slice(2, 4))
        .replaceAll('{MM}', day.slice(5, 7))
    const [before, after = ''] = filled.split('{N}')
    return { before, after }
}

/** The counter of a number in the series of this date (null: another series). */
export const counterOf = (number, settings, date) => {
    const { before, after } = parts(settings, date)
    const match = clean(number).toUpperCase().match(new RegExp(`^${escape(before)}(\\d+)${escape(after)}$`))
    return match ? Number(match[1]) : null
}

/** A number of this series with this counter. */
export const formatNumber = (settings, date, counter) => {
    const { before, after } = parts(settings, date)
    return `${before}${String(counter).padStart(settings.digits, '0')}${after}`
}

/**
 * Next free number of a type on a date: after the highest one already used in its series,
 * and at least the "start from" number when it belongs to the same series.
 */
export const nextNumber = (type, date, numbering, usedNumbers = []) => {
    const settings = numberingOf(type, numbering)
    const last = usedNumbers.reduce((max, number) => Math.max(max, counterOf(number, settings, date) ?? 0), 0)
    const start = settings.startFrom ? counterOf(settings.startFrom, settings, date) ?? 0 : 0
    return formatNumber(settings, date, Math.max(last + 1, start, 1))
}

/** The counter at the end of a number, as written (CO-2026-0007 -> '0007'), for the templates. */
export const shortNumber = number => clean(number).match(/(\d+)\D*$/)?.[1] || ''
