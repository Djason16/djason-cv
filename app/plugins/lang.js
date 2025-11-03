import { defineNuxtPlugin, useHead } from '#app'
import { computed, ref } from 'vue'
import seoMetaData from './translations/common/seoMetaData.js'

export default defineNuxtPlugin(() => {
    const currentLang = ref('french')
    const translations = ref({
        french: { ...seoMetaData.french, _loaded: false },
        english: { ...seoMetaData.english, _loaded: false }
    })

    // Set HTML lang attribute
    const locale = computed(() => (currentLang.value === 'french' ? 'fr' : 'en'))
    useHead({ htmlAttrs: { lang: locale.value } })

    // Translation function with variable replacement
    const t = (key, vars = {}) =>
        (translations.value[currentLang.value]?.[key] || key).replace(/{{(.*?)}}/g, (_, k) => vars[k.trim()] || _)

    // Dynamically load other translation modules
    const loadAdditionalTranslations = async lang => {
        if (translations.value[lang]._loaded) return

        const modules = await Promise.all([
            import('./translations/admin/clients.js'),
            import('./translations/admin/contracts.js'),
            import('./translations/admin/dashboard.js'),
            import('./translations/admin/interestRates.js'),
            import('./translations/admin/invoices.js'),
            import('./translations/admin/missions.js'),
            import('./translations/admin/quotes.js'),
            import('./translations/admin/settings.js'),
            import('./translations/auth/login.js'),
            import('./translations/common/index.js'),
            import('./translations/common/navigationFooter.js'),
            import('./translations/home/aboutMe.js'),
            import('./translations/home/hero.js'),
            import('./translations/home/project.js'),
            import('./translations/home/service.js'),
            import('./translations/home/skill.js'),
            import('./translations/legal/legal.js'),
            import('./translations/legal/privacy.js'),
            import('./translations/legal/refund.js'),
            import('./translations/legal/terms.js'),
            import('./translations/payMe/index.js')
        ])

        translations.value[lang] ||= {}
        modules.forEach(m => {
            if (m.default[lang]) translations.value[lang] = { ...translations.value[lang], ...m.default[lang] }
        })
        translations.value[lang]._loaded = true
    }

    // Switch language and load missing translations
    const setLang = async lang => {
        if (!['french', 'english'].includes(lang)) return
        currentLang.value = lang
        await loadAdditionalTranslations(lang)
    }

    return {
        provide: {
            lang: { current: currentLang, locale, availableLanguages: ['french', 'english'], setLang, getTranslation: t }
        }
    }
})