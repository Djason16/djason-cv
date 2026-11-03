import { reactive, toRefs } from 'vue'
import { useSiteSettingsStore } from '@/stores/siteSettings.js'

/*
 * Address of the site (NUXT_PUBLIC_FRONTEND_DOMAIN of the .env) and information about its owner (admin > Settings, stores/siteSettings.js):
 *   const site = useSite()
 *   site.url, site.name, site.email, site.phone, site.birthDate, site.siret, site.tva, site.address, site.invoiceAddress,
 *   site.linkedin, site.github, site.malt, site.instagram, site.whatsapp
 * Every value follows the admin changes at once.
 */
export const useSite = () => {
    const settings = useSiteSettingsStore()
    return reactive({ url: useRuntimeConfig().public.frontendDomain, ...toRefs(settings.values) })
}
