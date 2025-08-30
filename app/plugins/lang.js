import { defineNuxtPlugin } from '#app';
import { computed, ref } from 'vue';
import en from './translations/en.js';
import fr from './translations/fr.js';

// LANGUAGE PLUGIN: handles multilingual support and variable replacements
export default defineNuxtPlugin(() => {
    const currentLang = ref('french'); // reactive current language
    const translations = { english: en, french: fr }; // all available translations

    // Replace placeholders in a string with values from variables object
    const replaceVariables = (str, vars) =>
        str.replace(/{{(.*?)}}/g, (_, key) => vars[key.trim()] || _);

    return {
        provide: {
            lang: {
                current: currentLang,
                locale: computed(() => (currentLang.value === 'french' ? 'fr' : 'en')), // locale code
                availableLanguages: Object.keys(translations),

                // Switch current language if valid
                setLang: (lang) => translations[lang] && (currentLang.value = lang),

                // Retrieve translation with optional variable replacements
                getTranslation: (key, vars = {}) =>
                    replaceVariables(translations[currentLang.value]?.[key] || key, vars),
            },
        },
    };
});