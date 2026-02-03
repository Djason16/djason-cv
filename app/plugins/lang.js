import { defineNuxtPlugin, useHead, useRoute } from '#app'
import { withTrailingSlash } from '@/utils/pathHelpers.js'
import { computed, nextTick, ref } from 'vue'

import index from './translations/common/index.js'
import navigationFooter from './translations/common/navigationFooter.js'
import seoMetaData from './translations/common/seoMetaData.js'
import aboutMe from './translations/home/aboutMe.js'
import hero from './translations/home/hero.js'
import project from './translations/home/project.js'
import service from './translations/home/service.js'
import skill from './translations/home/skill.js'
import payMe from './translations/payMe/index.js'

// Supported languages
const LANGUAGES = ['french', 'english']

// Map route to translation module
const ROUTE_TO_MODULE = Object.fromEntries(
    Object.entries({
        'pay-me': 'payMe', legal: 'legal', terms: 'legal',
        'privacy': 'legal', 'refund-policy': 'legal', login: 'auth', admin: 'admin'
    }).map(([r, m]) => [withTrailingSlash(r), m])
)

// Preloaded translations
const STATIC_MODULES = { common: [seoMetaData, index, navigationFooter], home: [aboutMe, hero, project, service, skill], payMe: [payMe] }

// Lazy-loaded translation groups
const LAZY_MODULES = {
    admin: ['clients', 'contracts', 'dashboard', 'interestRates', 'invoices', 'missions', 'quotes', 'settings', 'calendar', 'unavailability', 'manualOverride', 'projects', 'env'],
    legal: ['legal', 'privacy', 'refund', 'terms'],
    auth: ['login']
}

// Merge modules into a structured translations object
const buildTranslations = modules =>
    Object.fromEntries(LANGUAGES.map(lang => [
        lang,
        Object.fromEntries(Object.entries(modules).map(([group, imports]) => [
            group, Object.assign({}, ...imports.map(m => m[lang]))
        ]))
    ]))

export default defineNuxtPlugin(() => {
    const currentLang = ref('french')
    const route = useRoute()
    const translations = ref(buildTranslations(STATIC_MODULES))
    const loadedModules = new Set(Object.keys(STATIC_MODULES).flatMap(g => LANGUAGES.map(l => `${g}-${l}`)))

    const locale = computed(() => currentLang.value === 'french' ? 'fr' : 'en')
    useHead({ htmlAttrs: { lang: locale } })

    const getActiveModule = () => {
        const page = route.path.split('/').filter(Boolean)[0]
        return page ? (ROUTE_TO_MODULE[withTrailingSlash(page)] || 'home') : 'home'
    }

    const t = (key, vars = {}) => {
        const lang = currentLang.value
        const active = getActiveModule()
        let text = translations.value[lang]?.[active]?.[key] || Object.values(translations.value[lang]).find(m => m[key])?.[key] || key
        return Object.keys(vars).length ? text.replace(/{{(.*?)}}/g, (_, k) => vars[k.trim()] ?? '') : text
    }

    const translationModules = import.meta.glob('./translations/**/*.js')

    const loadTranslationGroup = async (group, lang) => {
        const key = `${group}-${lang}`
        if (loadedModules.has(key)) return
        const results = await Promise.all((LAZY_MODULES[group] || []).map(m => {
            const path = `./translations/${group}/${m}.js`
            return translationModules[path]?.().catch(() => ({ default: {} })) ?? { default: {} }
        }))
        results.forEach(r => r.default?.[lang] && (translations.value[lang][group] = { ...translations.value[lang][group], ...r.default[lang] }))
        loadedModules.add(key)
    }

    const loadAllTranslations = lang => Promise.all(Object.keys(LAZY_MODULES).map(g => loadTranslationGroup(g, lang)))

    const setLang = lang => LANGUAGES.includes(lang) ? (currentLang.value = lang, loadAllTranslations(lang)) : Promise.resolve()

    if (process.client) nextTick(() => loadAllTranslations(currentLang.value))

    return {
        provide: {
            lang: {
                current: currentLang,
                locale,
                availableLanguages: LANGUAGES,
                setLang,
                getTranslation: t,
                loadGroup: g => loadTranslationGroup(g, currentLang.value)
            }
        }
    }
})