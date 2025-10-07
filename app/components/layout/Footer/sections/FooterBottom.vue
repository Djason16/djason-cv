<template>
    <!-- Decorative SVG divider -->
    <div class="divider" aria-hidden="true">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,256L720,160L1440,256L1440,322L0,322Z" :fill="`var(--fourth-color)`" />
        </svg>
    </div>

    <!-- Footer main container -->
    <div class="footer-bottom">
        <!-- Social icons loop -->
        <nav class="icons text-normal" aria-label="Social media links">
            <a v-for="(icon, i) in socialIcons" :key="i" :href="icon.link" target="_blank" rel="noopener noreferrer"
                :aria-label="icon.labelKey ? $lang.getTranslation(icon.labelKey, icon.vars) : icon.label"
                :title="icon.labelKey ? $lang.getTranslation(icon.labelKey, icon.vars) : icon.label">
                <i :class="icon.class"></i>
            </a>
        </nav>

        <!-- Copyright with dynamic year and name -->
        <p class="text-normal">
            &copy; {{ $lang.getTranslation('footerText', { year: currentYear, name: personalInfo.name }) }}
        </p>

        <!-- Footer links and auth buttons -->
        <div class="footer-links text-normal">
            <!-- Legal links -->
            <NuxtLink v-for="(link, i) in footerLinks" :key="i" :to="link.to" :aria-label="link.label"
                :title="$lang.getTranslation(link.translationKey) || link.label">
                {{ $lang.getTranslation(link.translationKey) }}
            </NuxtLink>

            <!-- Auth link (only show after check) -->
            <template v-if="authChecked">
                <NuxtLink v-if="!isAuthenticated" :to="withTrailingSlash('/login')"
                    :aria-label="$lang.getTranslation('loginLink')" :title="$lang.getTranslation('loginLink')">
                    {{ $lang.getTranslation('loginLink') }}
                </NuxtLink>
                <NuxtLink v-else :to="withTrailingSlash('/admin')" :aria-label="$lang.getTranslation('adminLink')"
                    :title="$lang.getTranslation('adminLink')">
                    {{ $lang.getTranslation('adminLink') }}
                </NuxtLink>
            </template>

        </div>
    </div>
</template>

<script setup>
import { withTrailingSlash } from '@/utils/pathHelpers'
import { personalInfo } from '@/utils/personalInfo.js'
import { onMounted, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { $lang } = useNuxtApp()
const { isAuthenticated, checkAuth } = useAuth()
const currentYear = new Date().getFullYear()
const authChecked = ref(false)

// Check user authentication on mount
onMounted(async () => {
    await checkAuth()
    authChecked.value = true
})

// Social links array
const socialIcons = [
    { link: `mailto:${personalInfo.email}`, class: 'fas fa-envelope', labelKey: 'sendEmail', vars: { email: personalInfo.email } },
    { link: `tel:${personalInfo.phone.replace(/\s+/g, '')}`, class: 'fas fa-phone', labelKey: 'callPhone', vars: { phone: personalInfo.phone } },
    { link: personalInfo.links.linkedin, class: 'fab fa-linkedin', label: 'LinkedIn' },
    { link: personalInfo.links.github, class: 'fab fa-github', label: 'GitHub' },
    { link: personalInfo.links.malt, class: 'fab fa-m', label: 'Malt' },
    { link: personalInfo.links.instagram, class: 'fab fa-instagram', label: 'Instagram' },
    { link: personalInfo.links.whatsapp, class: 'fab fa-whatsapp', label: 'WhatsApp' },
]

// Footer navigation links
const footerLinks = [
    { to: withTrailingSlash('/legal'), label: 'Legal Notice', translationKey: 'legal' },
    { to: withTrailingSlash('/terms'), label: 'Terms and Conditions', translationKey: 'terms' },
    { to: withTrailingSlash('/privacy'), label: 'Privacy Policy', translationKey: 'privacy' },
    { to: withTrailingSlash('/refund-policy'), label: 'Refund Policy', translationKey: 'refundPolicy' },
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
}

.divider svg {
    display: block;
    width: 100%;
    height: 122px
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
    color: inherit;
    transition: color 0.3s ease;
}

.icons a:hover {
    color: var(--third-color);
}

.footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 90vw;
}

.footer-links a {
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

.footer-links a:hover {
    color: var(--third-color);
}

@media (max-width: 1024px) {

    .icons a:hover,
    .footer-links a:hover {
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
}
</style>