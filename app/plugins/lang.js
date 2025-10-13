import { defineNuxtPlugin, useHead } from '#app'
import { ref, computed } from 'vue'
import en from './translations/en.js'
import fr from './translations/fr.js'

export default defineNuxtPlugin(() => {
    const currentLang = ref('french')
    const translations = { english: en, french: fr }
    const locale = computed(() => (currentLang.value === 'french' ? 'fr' : 'en'))

    // Reactively update <html lang>
    useHead({ htmlAttrs: { lang: locale } })

    // Translate with optional variable replacements
    const t = (key, vars = {}) =>
        (translations[currentLang.value]?.[key] || key).replace(/{{(.*?)}}/g, (_, k) => vars[k.trim()] || _)

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