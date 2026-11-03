import { DatabaseHelper } from './DatabaseHelper.js'

/*
 * Information about the site owner, edited from the admin (Settings) and stored in dc_settings:
 * identity, legal details and social links. Shown on the site, the documents and the emails.
 * The .env file keeps only what is secret or technical (database, Stripe, SMTP, bank details...).
 *
 *   const settings = await SettingsHelper.all()     { name: 'Djason CHERY', email: '...', ... }
 *   await SettingsHelper.save({ phone: '+33...' })  unknown keys are ignored
 */

// Every setting, with its empty default (the same list as stores/siteSettings.js)
export const SETTING_KEYS = [
    'name', 'email', 'phone', 'birthDate',
    'siret', 'tva', 'address', 'invoiceAddress',
    'linkedin', 'github', 'malt', 'instagram', 'whatsapp',
    // Photo of "About me" uploaded from the admin (/upload/images/...), empty: public/images/about-me.jpg
    'aboutPhoto',
    // Consumer mediator (required with consumers, art. L.612-1 and R.616-1 of the French Consumer Code): printed in the terms
    'mediatorName', 'mediatorAddress', 'mediatorUrl',
    // Numbers of the quotes, invoices and contracts (JSON, utils/numbering.js): prefix, format, figures, number to go on from
    'numbering',
]

export const SettingsHelper = {
    /** Every setting (empty text when not filled in yet). */
    async all() {
        const rows = await DatabaseHelper.fetchAll('SELECT `key`, value FROM dc_settings')
        const saved = Object.fromEntries(rows.map(row => [row.key, row.value ?? '']))
        return Object.fromEntries(SETTING_KEYS.map(key => [key, saved[key] ?? '']))
    },

    /** Saves the given settings; returns the names of the keys that were saved. */
    async save(changes) {
        const keys = Object.keys(changes).filter(key => SETTING_KEYS.includes(key))
        for (const key of keys)
            await DatabaseHelper.execute('INSERT INTO dc_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
                [key, String(changes[key] ?? '').trim()])
        return keys
    },
}
