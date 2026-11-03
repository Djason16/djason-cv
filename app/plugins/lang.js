import { ref } from 'vue'
import { LANGUAGES, translate } from './translations/translations.js'
import { useSiteTextsStore } from '@/stores/siteTexts.js'

/*
 * Languages of the site, read with useLang() (composables/useLang.js):
 *   const { getTranslation: t } = useLang()   then   {{ t('legal') }} in the template, t('footerText', { year: 2026, name: 'Site' }) in a script
 *   const lang = useLang()                     lang.current.value ('fr' / 'en'), lang.setLang('en')
 * Texts: plugins/translations/ (some can be changed from the admin: stores/siteTexts.js). Languages of the site: plugins/translations/translations.js.
 */
const STORAGE_KEY = 'selectedLanguage'

export default defineNuxtPlugin(() => {
    // Current language: the first one of LANGUAGES until the visitor changes it
    const current = ref(LANGUAGES[0])

    const lang = {
        current,
        availableLanguages: LANGUAGES,

        // Text of a key in the current language ("{{name}}" in the text is replaced by values.name);
        // a text changed from the admin (stores/siteTexts.js) replaces the one of plugins/translations/
        getTranslation: (key, values) => translate(current.value, key, values, useSiteTextsStore().changed),

        // remember = keep the language for the next visit (only allowed with functional cookies)
        setLang(code, remember = false) {
            if (!code || !LANGUAGES.includes(code)) return
            current.value = code
            if (remember) localStorage.setItem(STORAGE_KEY, code)
        },

        // Language kept during a previous visit
        restore() {
            lang.setLang(localStorage.getItem(STORAGE_KEY))
        },
    }

    // <html lang="..."> follows the current language
    useHead({ htmlAttrs: { lang: current } })

    return { provide: { lang } }
})
