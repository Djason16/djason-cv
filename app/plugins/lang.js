import { defineNuxtPlugin, useHead } from '#app'
import { computed, ref } from 'vue'

// Translation modules
import clients from './translations/admin/clients.js'
import contracts from './translations/admin/contracts.js'
import dashboard from './translations/admin/dashboard.js'
import interestRates from './translations/admin/interestRates.js'
import invoices from './translations/admin/invoices.js'
import missions from './translations/admin/missions.js'
import quotes from './translations/admin/quotes.js'
import settings from './translations/admin/settings.js'
import login from './translations/auth/login.js'
import index from './translations/common/index.js'
import navigationFooter from './translations/common/navigationFooter.js'
import seoMetadata from './translations/common/seoMetaData.js'
import aboutMe from './translations/home/aboutMe.js'
import hero from './translations/home/hero.js'
import project from './translations/home/project.js'
import service from './translations/home/service.js'
import skill from './translations/home/skill.js'
import legal from './translations/legal/legal.js'
import privacy from './translations/legal/privacy.js'
import refund from './translations/legal/refund.js'
import terms from './translations/legal/terms.js'
import payMe from './translations/payMe/index.js'

export default defineNuxtPlugin(() => {
    const currentLang = ref('french')

    // List of all translation modules
    const modules = [
        clients, contracts, dashboard, interestRates, invoices, missions,
        quotes, settings, login, index, navigationFooter, seoMetadata,
        aboutMe, hero, project, service, skill, legal, privacy, refund,
        terms, payMe
    ]

    // Merge all translation modules for a given language
    const buildTranslations = lang => modules.reduce((a, m) => ({ ...a, ...m[lang] }), {})

    const translations = {
        english: buildTranslations('english'),
        french: buildTranslations('french')
    }

    const locale = computed(() => currentLang.value === 'french' ? 'fr' : 'en')
    useHead({ htmlAttrs: { lang: locale } })

    // Get translation by key and interpolate variables
    const t = (key, vars = {}) =>
        (translations[currentLang.value]?.[key] || key)
            .replace(/{{(.*?)}}/g, (_, k) => vars[k.trim()] || _)

    return {
        provide: {
            lang: {
                current: currentLang,
                locale,
                availableLanguages: Object.keys(translations),
                setLang: l => translations[l] && (currentLang.value = l),
                getTranslation: t
            }
        }
    }
})