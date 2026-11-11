import common from './common/common'
import preferences from './common/preferences'
import seo from './common/seo'
import adminCalendar from './pages/admin/calendar'
import adminClients from './pages/admin/clients'
import adminDashboard from './pages/admin/dashboard'
import adminDocuments from './pages/admin/documents'
import adminMissions from './pages/admin/missions'
import adminProjects from './pages/admin/projects'
import adminSettings from './pages/admin/settings'
import adminTimezonesAfricaAmericas from './pages/admin/timezonesAfricaAmericas'
import adminTimezonesAsiaEuropeOceania from './pages/admin/timezonesAsiaEuropeOceania'
import adminContracts from './pages/admin/contracts'
import adminBilling from './pages/admin/billing'
import adminBillingContracts from './pages/admin/billingContracts'
import adminBillingDocument from './pages/admin/billingDocument'
import home from './pages/index'
import skills from './pages/skills'
import legal from './pages/legal'
import login from './pages/login'
import payMe from './pages/payMe'
import privacy from './pages/privacy'
import refundPolicy from './pages/refundPolicy'
import terms from './pages/terms'
import withdrawal from './pages/withdrawal'

/*
 * Languages of the site, the first one is the default.
 * One language = no language buttons. Two or more = buttons at the bottom right of the page.
 */
export const LANGUAGES: string[] = ['fr', 'en']

/*
 * Every translation file. Each one has a block per language, with the same keys:
 *   export default { fr: { heroTitle: 'Bonjour' }, en: { heroTitle: 'Hello' } }
 * A key exists in one file only (the first file that has it wins).
 * New file: create it (for example pages/about.js), import it above and add it to this list.
 */
export const TRANSLATIONS: Record<string, Record<string, string>>[] = [
    common, preferences, seo,
    home, skills, legal, privacy, terms, refundPolicy, withdrawal, payMe, login,
    adminDashboard, adminClients, adminMissions, adminDocuments, adminContracts, adminBilling, adminBillingContracts, adminBillingDocument, adminCalendar, adminTimezonesAfricaAmericas, adminTimezonesAsiaEuropeOceania, adminProjects, adminSettings,
]

/*
 * Texts shown to visitors that can be changed from the admin (Texts), without building the site again:
 * the texts of these files are the defaults, the changed ones are stored in dc_texts (server/helpers/TextsHelper.js).
 * billingDocument and contracts: the texts printed on the quotes, invoices and contracts.
 */
export const EDITABLE_TRANSLATIONS: Record<string, Record<string, Record<string, string>>> = { common, preferences, seo, home, skills, payMe, legal, privacy, terms, refundPolicy, withdrawal,
    billingDocument: adminBillingDocument, contracts: adminContracts }

/**
 * Text of a key in a language, with its {{values}} filled in. A missing text shows its key (easy to spot on the page).
 * @param changed texts changed from the admin ({ fr: { key: 'text' } }), used first
 */
export const translate = (language: string, key: string, values: Record<string, string | number> = {}, changed: Record<string, Record<string, string>> = {}): string => {
    const text = changed[language]?.[key] || (TRANSLATIONS.map((file) => file[language]?.[key]).find((found) => found !== undefined) ?? key)
    return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match: string, name: string) => String(values[name] ?? match))
}
