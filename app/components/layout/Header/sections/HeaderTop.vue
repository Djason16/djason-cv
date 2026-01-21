<template>
    <!-- Top header with logo and navigation -->
    <div class="header-top">
        <div class="header-top__content">
            <!-- Logo linking to home -->
            <div class="header-top__title">
                <NuxtLink to="/" class="header-top__logo-link"
                    :title="`${config.public.name} - ${$lang.getTranslation('home')}`">
                    <NuxtImg v-if="!fallback.value" :src="logoPath" :alt="config.public.name"
                        :title="`${config.public.name} - ${$lang.getTranslation('home')}`" class="header-top__logo"
                        format="webp" preload priority fetchpriority="high" @error="onError" />
                    <img v-else :src="logoPath" :alt="config.public.name"
                        :title="`${config.public.name} - ${$lang.getTranslation('home')}`" class="header-top__logo"
                        preload priority fetchpriority="high" />
                </NuxtLink>
            </div>

            <!-- Navigation links -->
            <nav class="header-top__nav" role="navigation" aria-label="Main Navigation">
                <NavLink v-if="isHomePage" v-for="(item, i) in homeNavItems" :key="i" :id="item.id"
                    :title="$lang.getTranslation(item.translationKey)">
                    <!-- Move aria-label to the interactive NavLink component -->
                    <span class="nav-text">{{ $lang.getTranslation(item.translationKey) }}</span>
                    <i :class="item.icon" class="nav-icon text-normal" aria-hidden="true"></i>
                </NavLink>

                <!-- Payment link -->
                <NuxtLink :to="withTrailingSlash('/pay-me')" class="nav-link text-normal text-bold text-uppercase"
                    rel="noopener noreferrer" :title="$lang.getTranslation('payMe')">
                    <span class="nav-text">{{ $lang.getTranslation('payMe') }}</span>
                    <i class="fas fa-credit-card nav-icon text-normal" aria-hidden="true"></i>
                </NuxtLink>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { useRuntimeConfig } from '#imports'
import { useImageFallback } from '@/composables/useImageFallback.js'
import { withTrailingSlash } from '@/utils/pathHelpers'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavLink from '~/components/ui/Nav/NavLink.vue'

const { $lang } = useNuxtApp()
const router = useRouter()
const config = useRuntimeConfig()

const logoPath = '/images/main_logo_light.png'

// Only show homepage links on the root route
const isHomePage = computed(() => router.currentRoute.value.path === '/')

// Fallback for a single logo
const { fallback, onError } = useImageFallback(false)

// Navigation items for homepage links
const homeNavItems = [
    { id: 'projects', translationKey: 'lastProjects', icon: 'fas fa-folder', label: 'Projects' },
    { id: 'about-me', translationKey: 'aboutMe', icon: 'fas fa-user', label: 'About Me' },
    { id: 'skills', translationKey: 'skillsTitle', icon: 'fas fa-lightbulb', label: 'Skills' },
    { id: 'services', translationKey: 'servicesTitle', icon: 'fas fa-tools', label: 'Services' }
]
</script>

<style scoped>
.header-top a::after,
.header-top .nav-link::after,
.header-top .nav-text::after,
.header-top .nav-icon::after {
    display: none;
}

.header-top {
    padding: 0 1.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 6rem;
    position: relative;
}

.header-top__content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
    position: relative;
}

.header-top__title,
.header-top__logo-link {
    display: flex;
    align-items: center;
    position: relative;
    left: 0;
    transform: none;
}

.header-top__logo {
    height: 2rem;
    width: auto;
    object-fit: contain;
}

.header-top__nav {
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.header-top__nav .nav-link {
    text-decoration: none;
    color: var(--text-color-light);
    transition: color 0.3s ease;
    cursor: pointer;
    will-change: color;
}

.header-top__nav .nav-link:hover {
    color: var(--fourth-color);
}

.nav-text {
    display: inline-block;
}

.nav-icon {
    display: none;
    color: var(--text-color-light);
    will-change: transform, opacity;
}

@media (max-width: 1024px) {
    .header-top__nav .nav-link:hover {
        color: inherit;
    }
}

@media (max-width: 768px) {
    .nav-text {
        display: none;
    }

    .nav-icon {
        display: inline-block;
    }
}

@media (max-width: 480px) {
    .header-top {
        padding: 0 1rem;
    }
}
</style>
