import { AreaHelper } from './AreaHelper.js'
import { DatabaseHelper } from './DatabaseHelper.js'
import { areaSource, isTicked, townOf } from '~/utils/address.js'

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
    // Area shown on the public pages instead of the address (worked out from it: AreaHelper), editable
    'area',
    // '1': the address (town, country) is the one of the billing address (utils/address.js)
    'sameAddress',
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
        const values = Object.fromEntries(SETTING_KEYS.map(key => [key, saved[key] ?? '']))
        // An address saved before the area existed: its area worked out once, then kept
        if (values.address && !values.area) {
            const area = await AreaHelper.of(areaSource(values))
            if (area) values.area = area, await SettingsHelper.save({ area })
        }
        return values
    },

    /** Saves the given settings; returns the names of the keys that were saved. */
    async save(changes) {
        const linked = ['address', 'invoiceAddress', 'sameAddress'].some(key => key in changes)
        const current = linked ? await SettingsHelper.all() : null
        if ('sameAddress' in changes) changes = { ...changes, sameAddress: isTicked(changes.sameAddress) ? '1' : '' }
        // Same address: the town and country of the billing address
        if (linked && isTicked(changes.sameAddress ?? current.sameAddress))
            changes = { ...changes, address: townOf(changes.invoiceAddress ?? current.invoiceAddress) }
        // A new address (or billing address it comes from) gives a new area, unless the area itself was just changed by hand
        if (linked) {
            const next = { ...current, ...changes }
            const moved = ['address', 'invoiceAddress', 'sameAddress'].some(key => key in changes && String(changes[key] ?? '').trim() !== current[key])
            const areaTyped = 'area' in changes && String(changes.area ?? '').trim() !== current.area
            // No service answered (null): the area already saved stays
            const area = moved && !areaTyped ? await AreaHelper.of(areaSource(next)) : null
            if (area !== null) changes = { ...changes, area }
        }
        const keys = Object.keys(changes).filter(key => SETTING_KEYS.includes(key))
        for (const key of keys)
            await DatabaseHelper.execute('INSERT INTO dc_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
                [key, String(changes[key] ?? '').trim()])
        return keys
    },
}
