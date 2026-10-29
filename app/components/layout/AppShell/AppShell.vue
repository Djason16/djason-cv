<template>
    <!-- Frame of every page (and of the error page): loader, header, page, footer, floating buttons, cookie banner, dialogs and notifications -->
    <Loader v-if="showLoader" />
    <!-- The content is always in the HTML (search engines): the loader covers it, it does not hide it -->
    <div>
        <!-- Floating controls stacked bottom-right -->
        <div class="floating-controls">
            <BackToTop />
            <ChangeLanguageButton />
        </div>
        <Header />
        <slot />
        <Footer />
        <PreferencesBanner />
        <AppDialog />
        <AppToasts />
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { onMounted, ref } from 'vue'
import Footer from '@/components/layout/Footer/Footer.vue'
import Header from '@/components/layout/Header/Header.vue'
import BackToTop from '@/components/ui/Button/BackToTop.vue'
import ChangeLanguageButton from '@/components/ui/Button/ChangeLanguageButton.vue'
import Loader from '@/components/ui/Loader/Loader.vue'
import AppDialog from '@/components/ui/Dialog/AppDialog.vue'
import AppToasts from '@/components/ui/Toast/AppToasts.vue'
import PreferencesBanner from '@/components/ui/PreferencesBanner/PreferencesBanner.vue'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

const lang = useLang()
const showLoader = ref(true)
const fontsLoaded = ref(false)
const userPreferences = useUserPreferencesStore()

// Without JavaScript the loader never leaves: hidden, so the page stays readable
useHead({ noscript: [{ innerHTML: '<style>.loader-wrapper { display: none; }</style>' }] })

onMounted(async () => {
    // Choice saved during a previous visit (cookie)
    userPreferences.loadPreferences()

    // Language of a previous visit, only if the visitor accepted functional cookies
    if (userPreferences.preferences.functional) lang.restore()

    // Waits for the fonts, so the text does not change size once the loader leaves
    try {
        await Promise.all([
            document.fonts.load('400 16px "Barlow Condensed"'),
            document.fonts.load('700 16px "Barlow Condensed"')
        ])
    } catch (err) {
        console.warn('Fonts failed to load:', err)
    } finally {
        fontsLoaded.value = true
    }

    // Control loader timing based on first visit and font load
    const alreadyVisited = localStorage.getItem('visited')
    // Short pause so the loader does not just flash
    await new Promise(r => setTimeout(r, 200))

    if (alreadyVisited && fontsLoaded.value) showLoader.value = false
    else {
        localStorage.setItem('visited', 'true')
        setTimeout(() => (showLoader.value = false), Math.max(2000, fontsLoaded.value ? 0 : 1000))
    }
})
</script>

<style>
/* Back to top and language buttons, stacked at the bottom right */
.floating-controls {
    position: fixed;
    bottom: 1.5rem;
    right: calc((100vw - 90vw) / 5 - 0.875rem);
    display: flex;
    flex-direction: column;
    gap: 1vh;
    z-index: 10;
}

/* Tablet and phone: closer to the edge */
@media (max-width: 1024px) {
    .floating-controls {
        right: 1.5rem;
    }
}
</style>