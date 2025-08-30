<template>
    <!-- Top header with logo and navigation -->
    <div class="header-top">
        <div class="header-top__content">
            <!-- Logo linking to home -->
            <div class="header-top__title">
                <NuxtLink to="/" class="header-top__logo-link" :title="$lang.getTranslation('home')">
                    <img src="/images/main_logo_light.png" alt="Djason CHERY Logo" class="header-top__logo" />
                </NuxtLink>
            </div>

            <!-- Navigation links -->
            <nav class="header-top__nav">
                <!-- Loop homepage links only on home page -->
                <NavLink v-if="isHomePage" v-for="(item, i) in homeNavItems" :key="i" :id="item.id">
                    <span class="nav-text">{{ $lang.getTranslation(item.translationKey) }}</span>
                    <i :class="item.icon" class="nav-icon text-normal" :aria-label="item.label"></i>
                </NavLink>

                <!-- Static link to payment page -->
                <NuxtLink to="/pay-me" class="nav-link text-normal text-bold text-uppercase" rel="noopener noreferrer">
                    <span class="nav-text">{{ $lang.getTranslation('payMe') }}</span>
                    <i class="fas fa-credit-card nav-icon text-normal" aria-label="Pay Me"></i>
                </NuxtLink>
            </nav>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavLink from '~/components/ui/Nav/NavLink.vue'

const { $lang } = useNuxtApp()
const router = useRouter()

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

<style scoped>
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
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    position: relative;
}

.header-top__title {
    position: relative;
    left: 0;
    transform: none;
    display: flex;
    align-items: center;
}

.header-top__logo-link {
    display: flex;
    align-items: center;
    height: 100%;
}

.header-top__logo {
    height: 2rem;
    width: auto;
    object-fit: contain;
}

.header-top__nav {
    display: flex;
    gap: 1.5rem;
    align-items: center;
}

.header-top__nav .nav-link {
    text-decoration: none;
    color: var(--text-color-light);
    transition: color 0.3s ease;
    cursor: pointer;
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
