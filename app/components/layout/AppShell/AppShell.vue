<template>
    <Loader v-if="showLoader" />
    <div v-show="!showLoader">
        <!-- Floating controls stacked bottom-right -->
        <div class="floating-controls">
            <BackToTop />
            <ChangeLanguageButton />
        </div>
        <Header />
        <slot />
        <Footer />
        <CookieBanner />
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { onMounted, ref } from 'vue'
import Footer from '~/components/layout/Footer/Footer.vue'
import Header from '~/components/layout/Header/Header.vue'
import BackToTop from '~/components/ui/Button/BackToTop.vue'
import ChangeLanguageButton from '~/components/ui/Button/ChangeLanguageButton.vue'
import CookieBanner from '~/components/ui/Cookie/CookieBanner.vue'
import Loader from '~/components/ui/Loader/Loader.vue'
import { useCookieConsentStore } from '~/stores/cookieConsentStore'

const { $lang } = useNuxtApp()
const showLoader = ref(true)
const fontsLoaded = ref(false)
const cookieConsentStore = useCookieConsentStore()

onMounted(async () => {
    // Load cookie preferences on client mount
    cookieConsentStore.loadPreferences()

    // Load fonts and mark DOM when ready
    try {
        await Promise.all([
            document.fonts.load('400 16px "Barlow Condensed"'),
            document.fonts.load('700 16px "Barlow Condensed"')
        ])
        document.documentElement.setAttribute('data-fonts-loaded', 'true')
    } catch (err) {
        console.warn('Fonts failed to load:', err)
    } finally {
        fontsLoaded.value = true
    }

    // Initialize language from localStorage
    const storedLang = localStorage.getItem('selectedLanguage')
    storedLang ? $lang.setLang(storedLang) : localStorage.setItem('selectedLanguage', $lang.current.value)

    // Control loader timing based on first visit and font load
    const alreadyVisited = localStorage.getItem('visited')
    await new Promise(r => setTimeout(r, 200)) // Brief delay for smoother transition

    if (alreadyVisited && fontsLoaded.value) showLoader.value = false
    else {
        localStorage.setItem('visited', 'true')
        setTimeout(() => (showLoader.value = false), Math.max(2000, fontsLoaded.value ? 0 : 1000))
    }
})
</script>

<style>
.floating-controls {
    position: fixed;
    bottom: 1.5rem;
    right: calc((100vw - 90vw) / 5 - 0.875rem);
    display: flex;
    flex-direction: column;
    gap: 1vh;
    z-index: 10;
}

@media (max-width: 1024px) {
    .floating-controls {
        right: 1.5rem;
    }
}
</style>