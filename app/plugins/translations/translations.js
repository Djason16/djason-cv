import common from './common/common.js'
import preferences from './common/preferences.js'
import seo from './common/seo.js'
import adminCalendar from './pages/admin/calendar.js'
import adminClients from './pages/admin/clients.js'
import adminDashboard from './pages/admin/dashboard.js'
import adminDocuments from './pages/admin/documents.js'
import adminMissions from './pages/admin/missions.js'
import adminProjects from './pages/admin/projects.js'
import adminSettings from './pages/admin/settings.js'
import adminTimezonesAfricaAmericas from './pages/admin/timezonesAfricaAmericas.js'
import adminTimezonesAsiaEuropeOceania from './pages/admin/timezonesAsiaEuropeOceania.js'
import adminContracts from './pages/admin/contracts.js'
import adminBilling from './pages/admin/billing.js'
import adminBillingContracts from './pages/admin/billingContracts.js'
import adminBillingDocument from './pages/admin/billingDocument.js'
import home from './pages/index.js'
import skills from './pages/skills.js'
import legal from './pages/legal.js'
import login from './pages/login.js'
import payMe from './pages/payMe.js'
import privacy from './pages/privacy.js'
import refundPolicy from './pages/refundPolicy.js'
import terms from './pages/terms.js'
import withdrawal from './pages/withdrawal.js'

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
    home, skills, legal, privacy, terms, refundPolicy, withdrawal, payMe, login,
    adminDashboard, adminClients, adminMissions, adminDocuments, adminContracts, adminBilling, adminBillingContracts, adminBillingDocument, adminCalendar, adminTimezonesAfricaAmericas, adminTimezonesAsiaEuropeOceania, adminProjects, adminSettings,
]

/*
 * Texts shown to visitors that can be changed from the admin (Texts), without building the site again:
 * the texts of these files are the defaults, the changed ones are stored in dc_texts (server/helpers/TextsHelper.js).
 * billingDocument and contracts: the texts printed on the quotes, invoices and contracts.
 */
/** @type {Record<string, Record<string, Record<string, string>>>} */
export const EDITABLE_TRANSLATIONS = { common, preferences, seo, home, skills, payMe, legal, privacy, terms, refundPolicy, withdrawal,
    billingDocument: adminBillingDocument, contracts: adminContracts }

/**
 * Text of a key in a language, with its {{values}} filled in. A missing text shows its key (easy to spot on the page).
 * @param {string} language
 * @param {string} key
 * @param {Record<string, string>} [values]
 * @param {Record<string, Record<string, string>>} [changed] texts changed from the admin ({ fr: { key: 'text' } }), used first
 * @returns {string}
 */
export const translate = (language, key, values = {}, changed = {}) => {
    const text = changed[language]?.[key] || (TRANSLATIONS.map((file) => file[language]?.[key]).find((found) => found !== undefined) ?? key)
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (/** @type {string} */ match, /** @type {string} */ name) => values[name] ?? match)
}
