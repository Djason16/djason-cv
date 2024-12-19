<template>
    <!-- Divider section with SVG path to create a decorative divider -->
    <div class="divider" aria-hidden="true">
        <!-- SVG to create the divider shape using a custom path -->
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,256L720,160L1440,256L1440,320L0,320Z" fill="var(--fourth-color)" />
        </svg>
    </div>

    <!-- Footer bottom section containing social media links and footer text -->
    <div class="footer-bottom">
        <!-- Navigation for social media links with icons -->
        <nav class="icons text-normal" aria-label="Social media links">
            <!-- Loop through the socialIcons array to create each social media link -->
            <a v-for="(icon, key) in socialIcons" :key="key" :href="icon.link" target="_blank" rel="noopener noreferrer"
                :aria-label="icon.label">
                <i :class="icon.class"></i> <!-- Icon for the social media link -->
            </a>
        </nav>

        <!-- Copyright text -->
        <p class="text-normal">
            &copy; {{ $lang.getTranslation('footerText', { year: currentYear, name: personalInfo.name }) }}
        </p>

        <!-- Footer links for legal, terms, privacy, and refund policy -->
        <div class="footer-links text-normal">
            <NuxtLink to="/legal" aria-label="Legal Notice">{{ $lang.getTranslation('legal') }}</NuxtLink>
            <NuxtLink to="/terms" aria-label="Terms and Conditions">{{ $lang.getTranslation('terms') }}</NuxtLink>
            <NuxtLink to="/privacy" aria-label="Privacy Policy">{{ $lang.getTranslation('privacy') }}</NuxtLink>
            <NuxtLink to="/refund-policy" aria-label="Refund Policy">{{ $lang.getTranslation('refundPolicy') }}
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
import { personalInfo } from "@/utils/personalInfo.js"; // Personal information

// Current language context
const { $lang } = useNuxtApp();

// Getting the current year to dynamically display it in the footer
const currentYear = new Date().getFullYear();

// Array containing social media links and associated icons
const socialIcons = [
    // Email link with an envelope icon
    { link: `mailto:${personalInfo.email}`, class: "fas fa-envelope", label: "Email" },

    // Phone link with a phone icon
    { link: `tel:${personalInfo.phone.replace(/\s+/g, "")}`, class: "fas fa-phone", label: "Phone" },

    // WhatsApp link with a WhatsApp icon
    { link: personalInfo.links.whatsapp, class: "fab fa-whatsapp", label: "WhatsApp" },

    // LinkedIn link with a LinkedIn icon
    { link: personalInfo.links.linkedin, class: "fab fa-linkedin", label: "LinkedIn" },

    // GitHub link with a GitHub icon
    { link: personalInfo.links.github, class: "fab fa-github", label: "GitHub" },
];
</script>

<style scoped>
.divider {
    width: 100%;
    overflow: hidden;
    line-height: 0;
    margin-top: -120px;
    position: relative;
    z-index: 2;
}

.divider svg {
    display: block;
    width: 100%;
    height: 120px;
}

.footer-bottom {
    background-color: var(--fourth-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 0 1.5rem 0;
    gap: 1.5rem;
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
    transition: color 0.3s ease;
}

.footer-links a:hover {
    color: var(--third-color);
}

@media (max-width: 1024px) {
    .icons a:hover {
        color: inherit;
    }

    .footer-links a:hover {
        color: inherit;
    }
}

@media (max-width: 768px) {
    .icons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        justify-items: center;
    }

    .icons a:nth-child(5) {
        grid-column: 1 / -1;
        justify-self: center;
    }
}
</style>
