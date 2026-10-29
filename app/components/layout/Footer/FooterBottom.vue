<template>
    <!-- Content of the footer: diagonal divider, social links, copyright, footer links and cookie settings -->
    <!-- Diagonal between the colored band and the footer -->
    <div class="divider" aria-hidden="true">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,256L720,160L1440,256L1440,322L0,322Z" :fill="`var(--fourth-color)`" />
        </svg>
    </div>

    <!-- Footer content -->
    <div class="footer-bottom">
        <!-- Social links loop -->
        <nav class="icons text-normal" aria-label="Social media links">
            <a v-for="(icon, i) in socialIcons" :key="i" :href="icon.link" target="_blank" rel="noopener noreferrer"
                :aria-label="icon.labelKey ? t(icon.labelKey, icon.vars) : icon.label"
                :title="icon.labelKey ? t(icon.labelKey, icon.vars) : icon.label">
                <i v-if="icon.class" :class="icon.class"></i>
                <span v-else v-html="icon.svg" class="malt-svg"></span>
            </a>
        </nav>

        <!-- Dynamic copyright -->
        <p class="text-normal">&copy; {{ t('footerText', {
            year: currentYear,
            name: site.name || ''
        }) }}</p>

        <!-- Footer links & auth -->
        <div class="footer-links text-normal">
            <NuxtLink v-for="(link, i) in footerLinks" :key="i" :to="link.to" :title="t(link.translationKey)">
                {{ t(link.translationKey) }}
            </NuxtLink>

            <!-- Shows the cookie banner again to change the choice (stores/userPreferences.js) -->
            <button type="button" class="footer-link" :title="t('prefsSettings')" @click="userPreferences.openSettings()">
                {{ t('prefsSettings') }}
            </button>

            <template v-if="mounted && authChecked">
                <NuxtLink v-if="!isAuthenticated" :to="withTrailingSlash('/login')"
                    :aria-label="t('loginLink')" :title="t('loginLink')">
                    {{ t('loginLink') }}
                </NuxtLink>
                <NuxtLink v-else :to="withTrailingSlash('/admin')" :aria-label="t('adminLink')"
                    :title="t('adminLink')">
                    {{ t('adminLink') }}
                </NuxtLink>
            </template>
        </div>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { useRuntimeConfig } from '#app'
import { withTrailingSlash } from '@/utils/pathHelpers.js'
import { useAuth } from '@/composables/useAuth.js'
import { onMounted, ref } from 'vue'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'

const { getTranslation: t } = useLang()

const config = useRuntimeConfig()
const site = useSite()
const { isAuthenticated, authChecked } = useAuth()

// "Login" or "Admin" link: only after the page is hydrated (the server does not know the session, so it never renders it)
const mounted = ref(false)
onMounted(() => { mounted.value = true })
const userPreferences = useUserPreferencesStore()

const currentYear = new Date().getFullYear()

// Contact details and social links of the .env (NUXT_PUBLIC_...)
const { linkedin = '', github = '', malt = '', instagram = '', whatsapp = '', contactEmail = '', contactPhone = '' } = config.public || {}

// Malt logo (not in Font Awesome)
const MaltIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104.3 104.3" width="32" height="32">
  <g>
    <path d="M69,35.3c-3.6-3.6-7.4-1.3-9.8,1.1L36.6,59c-2.4,2.4-4.9,6-1.1,9.8c3.7,3.8,7.4,1.3,9.8-1.1l22.6-22.6C70.3,42.7,72.6,38.8,69,35.3z" fill="currentColor"/>
    <path d="M47.4,34.3l4.8,4.8l4.9-4.9c0.3-0.3,0.7-0.6,1-0.9c-0.5-2.6-2-4.9-5.9-4.9s-5.4,2.3-5.9,4.9C46.7,33.6,47,34,47.4,34.3z" fill="currentColor"/>
    <path d="M57.1,69.9L52.2,65l-4.8,4.8c-0.4,0.4-0.7,0.7-1.1,1c0.5,2.6,2.1,5,5.9,5c3.8,0,5.3-2.4,5.9-5.1C57.8,70.5,57.4,70.3,57.1,69.9z" fill="currentColor"/>
    <path d="M45.4,45.9h-9.2c-3.4,0-7.7,1.1-7.7,6.1c0,3.8,2.4,5.3,5.1,5.9C33.8,57.6,45.4,45.9,45.4,45.9z" fill="currentColor"/>
    <path d="M71,46.2c-0.3,0.3-11.9,12-11.9,12h9.1c3.4,0,7.7-0.8,7.7-6.1C75.9,48.2,73.6,46.7,71,46.2z" fill="currentColor"/>
    <path d="M48.4,42.9l1.7-1.7l-4.8-4.8c-2.4-2.4-6-4.9-9.8-1.1c-2.8,2.8-2.1,5.5-0.7,7.7C35.2,42.9,48.4,42.9,48.4,42.9z" fill="currentColor"/>
    <path d="M56,61.2l-1.7,1.7l4.9,4.9c2.4,2.4,6.3,4.7,9.8,1.1c2.7-2.7,2.1-5.5,0.6-7.7C69.1,61.2,56,61.2,56,61.2z" fill="currentColor"/>
  </g>
</svg>`

// Social links: a Font Awesome icon or an SVG, with a translated label when it needs a value
const socialIcons = [
    { link: contactEmail ? `mailto:${contactEmail}` : '#', class: 'fas fa-envelope', labelKey: 'sendEmail', vars: { email: contactEmail } },
    { link: contactPhone ? `tel:${contactPhone.replace(/\s+/g, '')}` : '#', class: 'fas fa-phone', labelKey: 'callPhone', vars: { phone: contactPhone } },
    { link: whatsapp || '#', class: 'fab fa-whatsapp', label: 'WhatsApp' },
    { link: linkedin || '#', class: 'fab fa-linkedin', label: 'LinkedIn' },
    { link: github || '#', class: 'fab fa-github', label: 'GitHub' },
    { link: malt || '#', svg: MaltIcon, label: 'Malt' },
    { link: instagram || '#', class: 'fab fa-instagram', label: 'Instagram' },
]

// Legal pages
const footerLinks = [
    { to: withTrailingSlash('/legal'), translationKey: 'legal' },
    { to: withTrailingSlash('/terms'), translationKey: 'terms' },
    { to: withTrailingSlash('/privacy'), translationKey: 'privacy' },
    { to: withTrailingSlash('/refund-policy'), translationKey: 'refundPolicy' },
]
</script>

<style scoped>
.footer-bottom a::after,
.icons a::after,
.footer-links a::after {
    display: none;
}

.divider {
    width: 100%;
    overflow: hidden;
    line-height: 0;
    margin-top: -122px;
    position: relative;
    z-index: 2;
    margin-bottom: -1px;
}

.divider svg {
    display: block;
    width: 100%;
    height: 123px;
}

.footer-bottom {
    background-color: var(--fourth-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0 1.5rem 0;
    gap: 1.5rem;
    z-index: 1;
}

.footer-bottom>* {
    margin: 0;
}

.icons {
    display: flex;
    justify-content: center;
    gap: 1rem;
}

.icons a {
    min-height: 2.5vh;
    color: inherit;
    transition: color 0.3s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.icons a:hover {
    color: var(--third-color);
}

.malt-svg {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
}

.footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 90vw;
}

.footer-links a,
.footer-links .footer-link {
    margin: 0.25rem;
    color: inherit;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    padding: 0;
    transition: color 0.3s ease;
}

.footer-links a:hover,
.footer-links .footer-link:hover {
    color: var(--third-color);
}

@media (max-width: 1024px) {

    .icons a:hover,
    .footer-links a:hover,
    .footer-links .footer-link:hover {
        color: inherit;
    }
}

@media (max-width: 768px) {
    .icons {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
    }

    .icons a {
        width: 20%;
        text-align: center;
    }

    .malt-svg {
        width: 1.7rem;
    }
}
</style>