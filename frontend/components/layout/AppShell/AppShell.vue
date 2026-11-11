<template>
    <!-- Frame of every page (and of the error page): loader, header, page, footer, floating buttons, cookie banner, dialogs and notifications -->
    <!-- Loader: on the first visit until the fonts are ready, then on every page change -->
    <Transition name="loader-fade">
        <Loader v-if="showLoader" />
    </Transition>
    <!-- The content is always in the HTML (search engines): the loader covers it, it does not hide it -->
    <div>
        <!-- Floating controls stacked bottom-right -->
        <!-- Hidden while the cookie banner is open -->
        <Transition name="floating-controls">
            <div v-show="!userPreferences.bannerOpen" class="floating-controls">
                <ScrollButtons />
                <ChangeLanguageButton />
            </div>
        </Transition>
        <Header />
        <!-- The page, on an ink ground that stays during a page change: the background of the site never shows -->
        <main class="app-shell__page">
            <slot />
        </main>
        <Footer />
        <PreferencesBanner />
        <AppDialog />
        <AppToasts />
    </div>
</template>

<script setup lang="ts">
import { useLang } from '@/composables/useLang'
import { onMounted, onUnmounted, ref } from 'vue'
import Footer from '@/components/layout/Footer/Footer.vue'
import Header from '@/components/layout/Header/Header.vue'
import ScrollButtons from '@/components/ui/Button/ScrollButtons.vue'
import ChangeLanguageButton from '@/components/ui/Button/ChangeLanguageButton.vue'
import Loader from '@/components/ui/Loader/Loader.vue'
import AppDialog from '@/components/ui/Dialog/AppDialog.vue'
import AppToasts from '@/components/ui/Toast/AppToasts.vue'
import PreferencesBanner from '@/components/ui/PreferencesBanner/PreferencesBanner.vue'
import { useUserPreferencesStore } from '@/stores/userPreferences'
// The three fonts the loader waits for (below), asked for at once with the page instead of after the CSS: the loader
// ends sooner, it does not change otherwise
import archivoFont from '@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2?url'
import barlowLightFont from '@fontsource/barlow-condensed/files/barlow-condensed-latin-300-normal.woff2?url'
import barlowSemiBoldFont from '@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2?url'

useHead({
    link: [archivoFont, barlowLightFont, barlowSemiBoldFont].map((href) => ({ rel: 'preload', as: 'font', type: 'font/woff2', href, crossorigin: 'anonymous' as const })),
})

const lang = useLang()
const showLoader = ref(true)
const nuxtApp = useNuxtApp()

// Page change: the loader comes at once, and stays at least a moment so it never only flickers
const MIN_SHOWN_MS = 450
// Shown from the start: the first visit, and the frame that replaces the error page (leaving "page not found")
let shownAt = Date.now()
let hideTimer: ReturnType<typeof setTimeout> | undefined
// The first visit is handled by onMounted (fonts): the page hooks only act after it
let firstLoadDone = false
const showPageLoader = () => {
    if (!firstLoadDone) return
    clearTimeout(hideTimer)
    shownAt = Date.now()
    showLoader.value = true
}
const hidePageLoader = () => {
    if (!firstLoadDone) return
    clearTimeout(hideTimer)
    hideTimer = setTimeout(() => { showLoader.value = false }, Math.max(0, MIN_SHOWN_MS - (Date.now() - shownAt)))
}
const removeHooks = [nuxtApp.hook('page:start', showPageLoader), nuxtApp.hook('page:finish', hidePageLoader)]
onUnmounted(() => {
    removeHooks.forEach(remove => remove())
    clearTimeout(hideTimer)
})
const userPreferences = useUserPreferencesStore()

// Without JavaScript the loader never leaves: hidden, so the page stays readable
// and the opening of the home page plays at once
useHead({ noscript: [{ innerHTML: '<style>.loader-wrapper { display: none; } .hero * { animation: none !important; }</style>' }] })

onMounted(async () => {
    // Choice saved during a previous visit (cookie)
    userPreferences.loadPreferences()

    // Language of a previous visit, only if the visitor accepted functional cookies
    if (userPreferences.preferences.functional) lang.restore()

    // Waits for the fonts, so the text does not change size once the loader leaves (at most 2 s on a slow connection)
    await Promise.race([
        Promise.all([
            document.fonts.load('300 16px "Barlow Condensed"'),
            document.fonts.load('600 16px "Barlow Condensed"'),
            document.fonts.load('600 16px "Archivo Variable"')
        ]).catch(err => console.warn('Fonts failed to load:', err)),
        new Promise(resolve => setTimeout(resolve, 2000)),
    ])
    // At least the time of a page change, so it never only flickers (fonts already loaded: from the error page)
    await new Promise(resolve => setTimeout(resolve, Math.max(0, MIN_SHOWN_MS - (Date.now() - shownAt))))
    showLoader.value = false
    firstLoadDone = true
    // The opening of the home page (hero.css) can play now that it is visible
    document.documentElement.classList.add('is-ready')
})
</script>

<style>
/* Ground of the page: the ink of the sections, at least one screen high, so a page change never shows the background of the site */
.app-shell__page {
    display: block;
    min-height: 100vh;
    background: var(--ink-800);
}

/* Arrows (back to top, to the bottom) and language buttons, stacked at the bottom right */
.floating-controls {
    position: fixed;
    bottom: 24px;
    /* Exactly in the middle of the dark space on the right of the page (the page is 90vw wide: 5vw on each side) */
    right: 2.5vw;
    transform: translateX(50%);
    display: flex;
    flex-direction: column;
    /* Space between the buttons, also between the two arrows (ScrollButtons.vue) */
    --floating-gap: 1vh;
    gap: var(--floating-gap);
    z-index: 10;
}

/* Fades out while the cookie banner is open, back when it closes */
.floating-controls-enter-active,
.floating-controls-leave-active {
    transition: opacity var(--motion-base) var(--ease);
}

.floating-controls-enter-from,
.floating-controls-leave-to {
    opacity: 0;
}

/* Tablet and phone: the page takes the whole width, the buttons sit in the corner */
@media (max-width: 1024px) {
    .floating-controls {
        right: 24px;
        transform: none;
    }
}

/* Phone: closer to the corner, closer to each other (they hide less of the page) */
@media (max-width: 540px) {
    .floating-controls {
        right: 12px;
        bottom: 16px;
        --floating-gap: 6px;
    }
}
</style>