import { useAdminDataStore } from '@/stores/adminData.js'
import { useBillingStore } from '@/stores/billing.js'
import { useSiteSettingsStore } from '@/stores/siteSettings.js'
import { useSiteTextsStore } from '@/stores/siteTexts.js'
import { useProjects } from '@/composables/useProjects.js'
import { useSkills } from '@/composables/useSkills.js'
import { api } from '@/utils/api.js'
import { setTimeZone } from '@/utils/display.js'
import { startLiveData, watchData } from '@/utils/liveData.js'

/*
 * The shared data of the site follows the changes made elsewhere (another tab, a payment, the automatic tasks), loaded
 * again only when its table changed (utils/liveData.js). A list not loaded yet stays so: it is read fresh when needed.
 * A new list: one watchData here (or onDataChange in its component, composables/useLiveData.js).
 */
export default defineNuxtPlugin(() => {
    const adminData = useAdminDataStore()
    const billing = useBillingStore()
    const settings = useSiteSettingsStore()
    const texts = useSiteTextsStore()
    const { fetchProjects } = useProjects()
    const { fetchSkills } = useSkills()

    // Lists of the admin (missions also show their client and service)
    const ADMIN_LISTS = {
        clients: ['dc_clients'],
        missions: ['dc_missions', 'dc_clients', 'dc_services'],
        services: ['dc_services'],
        interestRates: ['dc_interest_rates'],
    }
    for (const [name, tables] of Object.entries(ADMIN_LISTS))
        watchData(tables, () => adminData.loaded[name] && adminData.fetch(name))

    // Quotes and invoices (each keeps a copy of its client)
    watchData(['dc_documents', 'dc_payments', 'dc_clients'], () => billing.loaded && billing.load(true))

    watchData(['dc_settings'], () => settings.load())
    watchData(['dc_texts'], () => texts.load())
    watchData(['dc_calendar_settings'], () => api.get('/calendar').then(res => setTimeZone(res.settings?.timezone)))
    // Projects and skills of the home page (and of the admin)
    watchData(['dc_projects'], fetchProjects)
    watchData(['dc_skills'], fetchSkills)

    startLiveData()
})
