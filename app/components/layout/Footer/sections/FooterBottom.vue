<template>
    <!-- Divider section with SVG path to create a decorative divider -->
    <div class="divider" aria-hidden="true">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,256L720,160L1440,256L1440,320L0,320Z" fill="var(--fourth-color)" />
        </svg>
    </div>

    <!-- Footer bottom section containing social media links and footer text -->
    <div class="footer-bottom">
        <!-- Navigation for social media links with icons -->
        <nav class="icons text-normal" aria-label="Social media links">
            <!-- Loop through the socialIcons array to create each social media link -->
            <a v-for="(icon, index) in socialIcons" :key="index" :href="icon.link" target="_blank"
                rel="noopener noreferrer" :aria-label="icon.label">
                <i :class="icon.class"></i>
            </a>
        </nav>

        <!-- Copyright text -->
        <p class="text-normal">
            &copy; {{ $lang.getTranslation('footerText', { year: currentYear, name: personalInfo.name }) }}
        </p>

        <!-- Footer links section -->
        <div class="footer-links text-normal">
            <!-- Loop through the footerLinks array to generate each link -->
            <NuxtLink v-for="(link, index) in footerLinks" :key="index" :to="link.to" :aria-label="link.label">
                {{ $lang.getTranslation(link.translationKey) }}
            </NuxtLink>
        </div>
    </div>
</template>

<script setup>
import { personalInfo } from "@/utils/personalInfo.js"; // Personal information

// Current language context
const { $lang } = useNuxtApp();

// Get current year for footer
const currentYear = new Date().getFullYear();

// Social media links and icons
const socialIcons = [
    { link: `mailto:${personalInfo.email}`, class: "fas fa-envelope", label: "Email" },
    { link: `tel:${personalInfo.phone.replace(/\s+/g, "")}`, class: "fas fa-phone", label: "Phone" },
    { link: personalInfo.links.linkedin, class: "fab fa-linkedin", label: "LinkedIn" },
    { link: personalInfo.links.github, class: "fab fa-github", label: "GitHub" },
    { link: personalInfo.links.malt, class: "fab fa-m", label: "Malt" },
    { link: personalInfo.links.instagram, class: "fab fa-instagram", label: "Instagram" },
    { link: personalInfo.links.whatsapp, class: "fab fa-whatsapp", label: "WhatsApp" },
];

// Footer navigation links (legal, privacy, etc.)
const footerLinks = [
    { to: "/legal", label: "Legal Notice", translationKey: "legal" },
    { to: "/terms", label: "Terms and Conditions", translationKey: "terms" },
    { to: "/privacy", label: "Privacy Policy", translationKey: "privacy" },
    { to: "/refund-policy", label: "Refund Policy", translationKey: "refundPolicy" },
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
