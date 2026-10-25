<template>
    <!-- Logo and navigation links of the header -->
    <div class="header-top">
        <div class="header-top__content">
            <!-- Logo linking to home -->
            <div class="header-top__title">
                <NuxtLink to="/" class="header-top__logo-link"
                    :title="`${site.name} - ${t('home')}`">
                    <NuxtImg :src="logoPath" :alt="site.name"
                        :title="`${site.name} - ${t('home')}`" class="header-top__logo"
                        width="200" height="80" loading="eager" fetchpriority="high" />
                </NuxtLink>
            </div>

            <!-- Navigation links -->
            <nav class="header-top__nav" role="navigation" aria-label="Main Navigation">
                <NavLink v-if="isHomePage" v-for="(item, i) in homeNavItems" :key="i" :id="item.id"
                    :title="t(item.translationKey)">
                    <span class="nav-text">{{ t(item.translationKey) }}</span>
                    <i :class="item.icon" class="nav-icon text-normal" aria-hidden="true"></i>
                </NavLink>

                <!-- Payment link -->
                <NuxtLink :to="withTrailingSlash('/pay-me')" class="nav-link text-normal text-bold text-uppercase"
                    rel="noopener noreferrer" :title="t('payMe')">
                    <span class="nav-text">{{ t('payMe') }}</span>
                    <i class="fas fa-credit-card nav-icon text-normal" aria-hidden="true"></i>
                </NuxtLink>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavLink from '@/components/ui/Nav/NavLink.vue'

const { getTranslation: t } = useLang()

const router = useRouter()
const site = useSite()

const logoPath = '/images/main_logo_light.png'

// Only show homepage links on the root route
const isHomePage = computed(() => router.currentRoute.value.path === '/')

// Navigation items for homepage links
const homeNavItems = [
    { id: 'projects', translationKey: 'lastProjects', icon: 'fas fa-folder', label: 'Projects' },
    { id: 'about-me', translationKey: 'aboutMe', icon: 'fas fa-user', label: 'About Me' },
    { id: 'skills', translationKey: 'skillsTitle', icon: 'fas fa-lightbulb', label: 'Skills' },
    { id: 'services', translationKey: 'servicesTitle', icon: 'fas fa-tools', label: 'Services' }
]
</script>
