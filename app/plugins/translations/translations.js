import common from './common/common.js'
import preferences from './common/preferences.js'
import seo from './common/seo.js'
import adminCalendar from './pages/admin/calendar.js'
import adminClients from './pages/admin/clients.js'
import adminDashboard from './pages/admin/dashboard.js'
import adminDocuments from './pages/admin/documents.js'
import adminDocumentChecks from './pages/admin/documentChecks.js'
import adminMissions from './pages/admin/missions.js'
import adminProjects from './pages/admin/projects.js'
import adminSettings from './pages/admin/settings.js'
import adminTimezonesAfricaAmericas from './pages/admin/timezonesAfricaAmericas.js'
import adminTimezonesAsiaEuropeOceania from './pages/admin/timezonesAsiaEuropeOceania.js'
import adminContracts from './pages/admin/contracts.js'
import home from './pages/index.js'
import legal from './pages/legal.js'
import login from './pages/login.js'
import payMe from './pages/payMe.js'
import privacy from './pages/privacy.js'
import refundPolicy from './pages/refundPolicy.js'
import terms from './pages/terms.js'

/*
 * Languages of the site, the first one is the default.
 * One language = no language buttons. Two or more = buttons at the bottom right of the page.
 */
/** @type {string[]} */
export const LANGUAGES = ['fr', 'en']

/*
 * Every translation file. Each one has a block per language, with the same keys:
 *   export default { fr: { heroTitle: 'Bonjour' }, en: { heroTitle: 'Hello' } }
 * A key exists in one file only (the first file that has it wins).
 * New file: create it (for example pages/about.js), import it above and add it to this list.
 */
/** @type {Record<string, Record<string, string>>[]} */
export const TRANSLATIONS = [
    common, preferences, seo,
    home, legal, privacy, terms, refundPolicy, payMe, login,
    adminDashboard, adminClients, adminMissions, adminDocuments, adminDocumentChecks, adminContracts, adminCalendar, adminTimezonesAfricaAmericas, adminTimezonesAsiaEuropeOceania, adminProjects, adminSettings,
]

/**
 * Text of a key in a language, with its {{values}} filled in. A missing text shows its key (easy to spot on the page).
 * @param {string} language
 * @param {string} key
 * @param {Record<string, string>} [values]
 * @returns {string}
 */
export const translate = (language, key, values = {}) => {
    const text = TRANSLATIONS.map((file) => file[language]?.[key]).find((found) => found !== undefined) ?? key
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (/** @type {string} */ match, /** @type {string} */ name) => values[name] ?? match)
}
