<template>
    <!-- Language switcher buttons stacked using FloatingButton -->
    <div class="language-switcher">
        <FloatingButton v-for="lang in availableLanguages" :key="lang.code"
            :class="{ active: currentLanguage === lang.code }"
            :aria-label="$lang.getTranslation('switchToLang', { lang: lang.label })" @click="switchLanguage(lang.code)">
            {{ lang.short }}
        </FloatingButton>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'
import FloatingButton from '~/components/ui/Button/FloatingButton.vue'
import { useCookieConsentStore } from '~/stores/cookieConsentStore'

const { $lang } = useNuxtApp()
const cookieStore = useCookieConsentStore()
const currentLanguage = $lang.current

// Prepare language options with short codes and labels
const availableLanguages = computed(() =>
    $lang.availableLanguages.map(code => ({
        code,
        short: code.slice(0, 2).toUpperCase(), // Short display: FR, EN
        label: $lang.getTranslation(code) || code
    }))
)

// Change language and persist only if functional cookies are accepted
const switchLanguage = lang => {
    $lang.setLang(lang)
    if (cookieStore.preferences.functional) {
        localStorage.setItem('selectedLanguage', lang)
    }
}
</script>

<style scoped>
.language-switcher {
    display: flex;
    flex-direction: column;
}

.language-switcher :deep(.floating-btn.active) {
    background-color: var(--first-color);
    color: var(--text-color-dark);
    opacity: 1;
}
</style>