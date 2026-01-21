<template>
    <!-- Language switcher buttons -->
    <div class="language-switcher">
        <button v-for="lang in availableLanguages" :key="lang.code" :class="{ active: currentLanguage === lang.code }"
            @click="switchLanguage(lang.code)" :aria-label="$lang.getTranslation('switchToLang', { lang: lang.label })"
            :title="$lang.getTranslation('switchToLang', { lang: lang.label })">
            {{ lang.short }}
        </button>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'

// Access Nuxt language plugin
const { $lang } = useNuxtApp()
const currentLanguage = $lang.current // reactive current language

// Prepare language options with short codes and labels
const availableLanguages = computed(() =>
    $lang.availableLanguages.map(code => ({
        code, // "english" ou "french"
        short: code.slice(0, 2).toUpperCase(), // short display
        label: $lang.getTranslation(code) || code
    }))
)

// Change language and persist selection
const switchLanguage = lang => {
    $lang.setLang(lang)
    localStorage.setItem('selectedLanguage', lang)
}
</script>

<style scoped>
.language-switcher {
    position: fixed;
    bottom: 1.5rem;
    right: calc((100vw - 90vw) / 5 - 0.875rem);
    display: flex;
    flex-direction: column;
    background-color: var(--third-color);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 10;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.language-switcher:hover {
    opacity: 1;
}

.language-switcher button {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
    color: var(--text-color-light);
}

.language-switcher button.active {
    background-color: var(--first-color);
    color: var(--text-color-dark);
}

@media (max-width: 1024px) {
    .language-switcher {
        right: 1.5rem;
        background-color: var(--fifth-color);
        opacity: .8;
    }

    .language-switcher:hover {
        opacity: .8;
    }
}
</style>
