import { defineNuxtPlugin, useHead, useRoute } from '#app'
import { computed, nextTick, ref } from 'vue'

// Critical translations loaded synchronously
import index from './translations/common/index.js'
import navigationFooter from './translations/common/navigationFooter.js'
import seoMetaData from './translations/common/seoMetaData.js'
import aboutMe from './translations/home/aboutMe.js'
import hero from './translations/home/hero.js'
import project from './translations/home/project.js'
import service from './translations/home/service.js'
import skill from './translations/home/skill.js'
import payMe from './translations/payMe/index.js'

export default defineNuxtPlugin(() => {
    const currentLang = ref('french')
    const route = useRoute()

    // Organize translations by language and module
    const translations = ref({
        french: {
            common: { ...seoMetaData.french, ...index.french, ...navigationFooter.french },
            home: { ...aboutMe.french, ...hero.french, ...project.french, ...service.french, ...skill.french },
            payMe: { ...payMe.french }
        },
        english: {
            common: { ...seoMetaData.english, ...index.english, ...navigationFooter.english },
            home: { ...aboutMe.english, ...hero.english, ...project.english, ...service.english, ...skill.english },
            payMe: { ...payMe.english }
        }
    })

    const loadedModules = new Set(['common-french', 'common-english', 'home-french', 'home-english', 'payMe-french', 'payMe-english'])
    const locale = computed(() => (currentLang.value === 'french' ? 'fr' : 'en'))
    useHead({ htmlAttrs: { lang: locale } })

    // Determine active module based on URL
    const getActiveModule = () => {
        const parts = route.path.split('/').filter(Boolean)
        if (!parts.length) return 'home'
        const page = parts[0]
        return ['admin', 'legal', 'auth', 'pay-me'].includes(page) ? page : 'home'
    }

    // Translation function with variable replacement
    const t = (key, vars = {}) => {
        const lang = currentLang.value
        const activeModule = getActiveModule()
        let text = translations.value[lang]?.[activeModule]?.[key]

        if (!text) {
            for (const mod in translations.value[lang]) {
                if (mod === activeModule) continue
                text = translations.value[lang][mod]?.[key]
                if (text) break
            }
        }

        text = text || key
        return Object.keys(vars).length
            ? text.replace(/{{(.*?)}}/g, (_, k) => vars[k.trim()] ?? '')
            : text
    }

    const translationModules = import.meta.glob('./translations/**/*.js')
    const translationGroups = {
        admin: ['clients', 'contracts', 'dashboard', 'interestRates', 'invoices', 'missions', 'quotes', 'settings', 'calendar', 'unavailability', 'manualOverride', 'projects', 'env'],
        legal: ['legal', 'privacy', 'refund', 'terms'],
        auth: ['login']
    }

    const loadTranslationGroup = async (group, lang) => {
        const key = `${group}-${lang}`
        if (loadedModules.has(key)) return
        const folder = group === 'payMe' ? 'payMe' : group
        const modules = translationGroups[group] || []

        const results = await Promise.all(modules.map(async m => {
            const path = `./translations/${folder}/${m}.js`
            return translationModules[path] ? translationModules[path]().catch(() => ({ default: {} })) : { default: {} }
        }))

        results.forEach(r => {
            if (r.default?.[lang]) translations.value[lang][group] = { ...translations.value[lang][group], ...r.default[lang] }
        })
        loadedModules.add(key)
    }

    const loadAllTranslations = lang => Promise.all(Object.keys(translationGroups).map(g => loadTranslationGroup(g, lang)))
    const setLang = lang => {
        if (!['french', 'english'].includes(lang)) return Promise.resolve()
        currentLang.value = lang
        return loadAllTranslations(lang)
    }

    if (process.client) nextTick(() => loadAllTranslations(currentLang.value))

    return {
        provide: {
            lang: { current: currentLang, locale, availableLanguages: ['french', 'english'], setLang, getTranslation: t, loadGroup: g => loadTranslationGroup(g, currentLang.value) }
        }
    }
})