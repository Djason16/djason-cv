import { DatabaseHelper } from '../utils/DatabaseHelper'
import { EDITABLE_TRANSLATIONS, LANGUAGES } from '~/plugins/translations/translations'

/*
 * Texts of the site changed from the admin (Texts), stored in dc_texts: the site shows them at once, without a new build.
 * The defaults stay in plugins/translations/ (only the files of EDITABLE_TRANSLATIONS can be changed).
 *
 *   const changed = await TextsHelper.changed()          { fr: { heroTitle: '...' }, en: {} }
 *   await TextsHelper.save('fr', 'heroTitle', 'Hello')   empty text or the default one = back to the default
 */

// Default text of a key, or undefined when the key cannot be changed
const defaultText = (lang: string, key: string) =>
    Object.values(EDITABLE_TRANSLATIONS).map(file => (file as Record<string, Record<string, string>>)[lang]?.[key]).find(text => text !== undefined)

export const TextsHelper = {
    /** Changed texts, by language. */
    async changed() {
        const rows = await DatabaseHelper.fetchAll('SELECT lang, `key`, value FROM dc_texts')
        const changed: Record<string, Record<string, string>> = Object.fromEntries(LANGUAGES.map(lang => [lang, {}]))
        for (const row of rows) if (changed[row.lang] && defaultText(row.lang, row.key) !== undefined) changed[row.lang]![row.key] = row.value
        return changed
    },

    /** Saves one text; false when the language or the key cannot be changed. */
    async save(lang: string, key: string, value: unknown) {
        if (!LANGUAGES.includes(lang) || defaultText(lang, key) === undefined) return false
        const text = String(value ?? '').trim()
        if (!text || text === defaultText(lang, key))
            await DatabaseHelper.execute('DELETE FROM dc_texts WHERE lang = ? AND `key` = ?', [lang, key])
        else
            await DatabaseHelper.execute('INSERT INTO dc_texts (lang, `key`, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
                [lang, key, text])
        return true
    },
}
