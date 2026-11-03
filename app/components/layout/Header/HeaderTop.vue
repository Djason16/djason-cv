<template>
    <!-- Logo and navigation links of the header -->
    <div class="header-top">
        <div class="header-top__content">
            <!-- Logo linking to home -->
            <div class="header-top__title">
                <NuxtLink to="/" class="header-top__logo-link"
                    :title="`${site.name} - ${t('home')}`">
                    <AppImage :src="logoPath" :alt="site.name" :title="`${site.name} - ${t('home')}`"
                        class="header-top__logo" width="200" height="80" priority :fallback="''" />
                </NuxtLink>
            </div>

            <!-- Links to the sections of the home page, in the middle -->
            <nav class="header-top__nav" role="navigation" aria-label="Main Navigation">
                <NavLink v-if="isHomePage" v-for="(item, i) in homeNavItems" :key="i" :id="item.id"
                    :active="activeSection === item.id" :title="t(item.translationKey)">
                    {{ t(item.translationKey) }}
                </NavLink>
            </nav>

            <!-- Tablets and phones: one button opens the full screen menu -->
            <button type="button" class="header-top__menu text-label" :aria-expanded="menuOpen" aria-controls="mobile-menu"
                @click="menuOpen = !menuOpen">
                {{ menuOpen ? t('close') : t('menu') }}
                <span class="header-top__burger" :class="{ 'is-open': menuOpen }" aria-hidden="true"><span></span><span></span></span>
            </button>

            <!-- Payment link on the right -->
            <NuxtLink :to="withTrailingSlash('/pay-me')" class="nav-link header-top__pay text-label" :title="t('payMe')">
                {{ t('payMe') }}
            </NuxtLink>
        </div>

        <MobileMenu :open="menuOpen" :items="homeNavItems" @close="menuOpen = false" />
    </div>
</template>

<script setup>
import AppImage from '@/components/ui/Image/AppImage.vue'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavLink from '@/components/ui/Nav/NavLink.vue'
import MobileMenu from './MobileMenu.vue'

const { getTranslation: t } = useLang()

const router = useRouter()
const site = useSite()

const logoPath = '/images/main_logo_light.png'

// Only show homepage links on the root route
const isHomePage = computed(() => router.currentRoute.value.path === '/')

// Navigation items for homepage links
const homeNavItems = [
    { id: 'projects', translationKey: 'lastProjects', label: 'Projects' },
    { id: 'about-me', translationKey: 'aboutMe', label: 'About Me' },
    { id: 'skills', translationKey: 'skillsTitle', label: 'Skills' },
    { id: 'services', translationKey: 'servicesTitle', label: 'Services' },
    { id: 'contact', translationKey: 'contactLabel', label: 'Contact' }
]

// Section in the middle of the screen: its link is highlighted
// Full screen menu of tablets and phones
const menuOpen = ref(false)

const activeSection = ref('')
let observer = null
const watchSections = () => {
    observer?.disconnect()
    activeSection.value = ''
    if (!isHomePage.value) return
    observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) activeSection.value = entry.target.id
    }, { rootMargin: '-45% 0px -50% 0px' })
    homeNavItems.forEach(item => { const el = document.getElementById(item.id); if (el) observer.observe(el) })
}
onMounted(watchSections)
watch(isHomePage, () => setTimeout(watchSections, 100))
onUnmounted(() => observer?.disconnect())
</script>
