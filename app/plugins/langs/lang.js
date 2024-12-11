import { defineNuxtPlugin } from '#app';
import { ref } from 'vue';
import en from './translations/en.js';
import fr from './translations/fr.js';

// ======================================================
// LANGUAGE PLUGIN
// Provides multilingual support (English and French) for the application.
// Offers dynamic language switching and variable replacement in translations.
// ======================================================

export default defineNuxtPlugin(() => {
    // Reactive variable to store the current language.
    const currentLang = ref('french');

    // Object containing all available translations.
    const translations = { english: en, french: fr };

    /**
     * Replaces placeholder variables in a translation string with actual values.
     * Example: "Welcome, {{name}}" => "Welcome, John" (if variables = { name: 'John' }).
     * 
     * @param {string} str - The translation string containing placeholders.
     * @param {object} variables - The key-value pairs to replace placeholders.
     * @returns {string} - The processed string with variables replaced.
     */
    const replaceVariables = (str, variables) => {
        return str.replace(/{{(.*?)}}/g, (match, p1) => variables[p1] || match);
    };

    // Return the plugin object, injecting the `lang` utility into the Nuxt app.
    return {
        provide: {
            lang: {
                // Reactive property to get the current language.
                current: currentLang,

                // Computed property to return the appropriate locale code (e.g., 'en' or 'fr').
                locale: computed(() => currentLang.value === "french" ? "fr" : "en"),

                /**
                 * Changes the current language if the specified language exists in `translations`.
                 * 
                 * @param {string} lang - The new language to set ('english' or 'french').
                 */
                setLang: (lang) => {
                    if (translations[lang]) {
                        currentLang.value = lang;
                    }
                },

                /**
                 * Retrieves the translation for a given key in the current language.
                 * If the key is not found, it returns the key itself as a fallback.
                 * Supports variable replacement for placeholders.
                 * 
                 * @param {string} key - The key for the desired translation.
                 * @param {object} variables - Optional object to replace placeholders in the translation.
                 * @returns {string} - The translated string with placeholders replaced.
                 */
                getTranslation: (key, variables = {}) => {
                    const translation = translations[currentLang.value]?.[key] || key;
                    return replaceVariables(translation, variables);
                },
            },
        },
    };
});