<template>
    <!-- Footer: the name and a short text, then the sections, contact, social links and legal pages; a last line -->
    <div class="footer-bottom">
        <div class="footer-main text-body">
            <div class="footer-brand">
                <p class="footer-brand__name text-display-m">{{ site.name }}</p>
                <p class="footer-brand__text text-body">{{ t('footerBrandText') }}</p>
            </div>

            <!-- Sections of the home page -->
            <nav class="footer-column" :aria-label="t('footerNavTitle')">
                <p class="eyebrow footer-column__title">{{ t('footerNavTitle') }}</p>
                <a v-for="item in sections" :key="item.id" :href="`/#${item.id}`" :title="t(item.translationKey)" @click.prevent="goToSection(item.id)">{{ t(item.translationKey) }}</a>
                <NuxtLink :to="withTrailingSlash('/pay-me')" :title="t('payMe')">{{ t('payMe') }}</NuxtLink>
            </nav>

            <div class="footer-column">
                <p class="eyebrow footer-column__title">{{ t('footerContactTitle') }}</p>
                <a v-if="site.email" :href="`mailto:${site.email}`" :title="site.email">{{ site.email }}</a>
                <a v-if="site.phone" :href="`tel:${site.phone.replace(/\s+/g, '')}`" :title="site.phone">{{ site.phone }}</a>
                <p v-if="site.area">{{ site.area }}</p>
            </div>

            <!-- Social links (admin > My info), only the ones filled in -->
            <nav v-if="socials.length" class="footer-column" :aria-label="t('footerSocialTitle')">
                <p class="eyebrow footer-column__title">{{ t('footerSocialTitle') }}</p>
                <a v-for="social in socials" :key="social.label" :href="social.link" :title="social.label" target="_blank" rel="noopener noreferrer">{{ social.label }}</a>
            </nav>

            <!-- Legal pages only -->
            <nav class="footer-column" :aria-label="t('footerLegalTitle')">
                <p class="eyebrow footer-column__title">{{ t('footerLegalTitle') }}</p>
                <NuxtLink v-for="link in legalLinks" :key="link.translationKey" :to="link.to" :title="t(link.translationKey)">{{ t(link.translationKey) }}</NuxtLink>
            </nav>
        </div>

        <!-- Last line: copyright on the left, cookie settings and login in the middle, jobs on the right -->
        <div class="footer-bar text-label">
            <p>&copy; {{ currentYear }} {{ site.name }}</p>
            <div class="footer-bar__links">
                <!-- Shows the cookie banner again to change the choice (stores/userPreferences.js) -->
                <button type="button" class="footer-link" @click="userPreferences.openSettings()">{{ t('prefsSettings') }}</button>
                <!-- "Login" or "Admin": only after the page is hydrated (the server does not know the session) -->
                <template v-if="mounted && authChecked">
                    <NuxtLink v-if="!isAuthenticated" :to="withTrailingSlash('/login')" :title="t('loginLink')">{{ t('loginLink') }}</NuxtLink>
                    <NuxtLink v-else :to="withTrailingSlash('/admin')" :title="t('adminLink')">{{ t('adminLink') }}</NuxtLink>
                </template>
            </div>
            <p>{{ t('heroJobs') }}</p>
        </div>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'
import { scrollToSection } from '@/utils/scroll.js'

const { getTranslation: t } = useLang()
const site = useSite()
const { isAuthenticated, authChecked } = useAuth()
const userPreferences = useUserPreferencesStore()

const mounted = ref(false)
onMounted(() => { mounted.value = true })

const currentYear = new Date().getFullYear()
const router = useRouter()

// Sections of the home page (the same as the header)
const sections = [
    { id: 'projects', translationKey: 'lastProjects' },
    { id: 'about-me', translationKey: 'aboutMe' },
    { id: 'skills', translationKey: 'skillsTitle' },
    { id: 'services', translationKey: 'servicesTitle' },
    { id: 'contact', translationKey: 'contactLabel' },
]

// Goes to the home page if needed, then to the section
const goToSection = async id => {
    if (router.currentRoute.value.path !== '/') await router.push('/')
    await nextTick()
    scrollToSection(id)
}

// Social links filled in (admin > My info)
const socials = computed(() => [
    { label: 'LinkedIn', link: site.linkedin },
    { label: 'GitHub', link: site.github },
    { label: 'Malt', link: site.malt },
    { label: 'Instagram', link: site.instagram },
    { label: 'WhatsApp', link: site.whatsapp },
].filter(social => social.link))

// Legal pages
const legalLinks = [
    { to: withTrailingSlash('/legal'), translationKey: 'legal' },
    { to: withTrailingSlash('/terms'), translationKey: 'terms' },
    { to: withTrailingSlash('/privacy'), translationKey: 'privacy' },
    { to: withTrailingSlash('/refund-policy'), translationKey: 'refundPolicy' },
    // Online withdrawal of a consumer (art. L.221-21 of the French Consumer Code)
    { to: withTrailingSlash('/withdrawal'), translationKey: 'withdrawal' },
]
</script>

<style scoped>
/* Footer on the ink black, a thin rule above it, the same width as the sections */
.footer-bottom {
    --accent: var(--mint);
    padding: 7rem var(--page-gutter) 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    background: var(--ink-900);
    color: var(--paper);
}

.footer-bottom a::after {
    display: none;
}

.footer-bottom p {
    margin: 0;
}

.footer-main,
.footer-bar {
    max-width: 1320px;
    margin: 0 auto;
}

.footer-main {
    display: grid;
    grid-template-columns: minmax(0, 2fr) repeat(4, minmax(0, 1fr));
    gap: 2.5rem;
    padding-bottom: 5rem;
}

.footer-brand__name {
    margin-bottom: 1.25rem !important;
}

.footer-brand__text {
    max-width: 20rem;
    color: var(--paper-muted);
}

.footer-column {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.footer-column__title {
    margin-bottom: 0.6rem !important;
}

.footer-column p,
.footer-column a,
.footer-column .footer-link {
    width: fit-content;
    padding: 0;
    border: none;
    background: none;
    color: var(--paper-muted);
    text-align: left;
    cursor: pointer;
    transition: color var(--motion-fast) var(--ease);
}

@media (hover: hover) and (min-width: 1025px) {
    .footer-column a:hover,
    .footer-column .footer-link:hover {
        color: var(--paper);
    }
}

/* Last line: copyright, star, jobs */
.footer-bar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding-top: 1.75rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    color: var(--paper-muted);
}

.footer-bar p:last-child {
    justify-self: end;
}

/* Cookie settings and login: small links in the middle of the last line */
.footer-bar__links {
    display: flex;
    gap: 2rem;
}

.footer-bar__links a,
.footer-bar__links .footer-link {
    padding: 0;
    border: none;
    background: none;
    /* Same letters as the rest of the last line */
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    color: var(--paper-muted);
    font: inherit;
    cursor: pointer;
    transition: color var(--motion-fast) var(--ease);
}

@media (hover: hover) and (min-width: 1025px) {
    .footer-bar__links a:hover,
    .footer-bar__links .footer-link:hover {
        color: var(--paper);
    }
}

/* Tablet: the name on its own line, the columns two by two */
@media (max-width: 1024px) {
    .footer-bottom {
        padding: 4rem var(--page-gutter) 1.75rem;
    }

    .footer-main {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 2rem;
        padding-bottom: 3rem;
    }

    .footer-brand {
        grid-column: 1 / -1;
    }
}

/* Tablet upright: less room above and under the footer */
@media (max-width: 768px) {
    .footer-bottom {
        padding: 3rem var(--page-gutter) 1.5rem;
    }

    .footer-main {
        padding-bottom: 2.25rem;
    }
}

/* Phone: the name on top, the columns two by two, the last line stacked and centered; less room again */
@media (max-width: 600px) {
    .footer-bottom {
        padding: 2.5rem var(--page-gutter) 1.25rem;
    }

    .footer-main {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 1.75rem 1.5rem;
        padding-bottom: 1.75rem;
    }

    .footer-bar {
        grid-template-columns: 1fr;
        justify-items: center;
        gap: 1rem;
        text-align: center;
    }

    .footer-bar p:last-child {
        justify-self: center;
    }

    /* One link per line, centered: nothing under the floating buttons of the corner */
    .footer-bar__links {
        flex-direction: column;
        align-items: center;
        gap: 0.6rem;
    }
}
</style>
