/**
 * Generate SEO metadata dynamically based on the page key and current language.
 * This function pulls translations and personal information to construct meta tags.
 *
 * @param {string} pageKey - The key representing the current page (e.g., "index", "privacy").
 * @param {object} $lang - The current language configuration with translations and locale information.
 * @returns {object} - An object containing SEO metadata for the specified page.
 */

// Import necessary modules and data sources
import { useSeoMeta } from "#imports";
import { personalInfo } from "./personalInfo";

/**
 * Main SEO metadata function:
 * Constructs the metadata for each page based on the key and translations.
 * Handles Open Graph (OG) and Twitter Card settings for social media previews.
 * Provides fallback metadata for undefined pages.
 */
export const seoMetaData = (pageKey, $lang) => {
    const name = personalInfo.name;

    const seoData = {
        // SEO metadata for the home page
        index: {
            lang: $lang.locale,
            title: $lang.getTranslation("seoIndexTitle", { name }),
            description: $lang.getTranslation("seoIndexDescription", { name }),
            author: name,
            keywords: "Djason Chery, Portfolio, Full-Stack Developer, Développeur Full-Stack, Web Development, Développement Web, Creative Solutions, Solutions Créatives, Expert Post-Production, Expert en Post-Production, CV en ligne, Online CV, Profil Professionnel, Digital Skills, Compétences Numériques",
            "og:title": $lang.getTranslation("seoIndexTitle", { name }),
            "og:description": $lang.getTranslation("seoIndexDescription", { name }),
            "og:type": "website",
            "og:url": "https://djason-chery.dev",
            "og:image": "/images/profile.jpg",
            "twitter:card": "summary_large_image",
            "twitter:title": $lang.getTranslation("seoIndexTitle", { name }),
            "twitter:description": $lang.getTranslation("seoIndexDescription", { name }),
            "twitter:image": "/images/profile.jpg",
            icon: "/favicon_dc.jpg",
        },

        // SEO metadata for the privacy policy page
        privacy: {
            lang: $lang.locale,
            title: $lang.getTranslation("seoPrivacyTitle", { name }),
            description: $lang.getTranslation("seoPrivacyDescription", { name }),
            author: name,
            keywords: "Privacy Policy, Politique de confidentialité, Data Security, Sécurité des données, User Information Protection, Protection des informations utilisateur, Online Privacy, Vie privée en ligne, GDPR Compliance, Conformité RGPD, Legal Terms, Mentions légales",
            "og:title": $lang.getTranslation("seoPrivacyTitle", { name }),
            "og:description": $lang.getTranslation("seoPrivacyDescription", { name }),
            "og:type": "website",
            "og:url": "https://djason-chery.dev/privacy",
            "og:image": "/images/privacy.jpg",
            "twitter:card": "summary_large_image",
            "twitter:title": $lang.getTranslation("seoPrivacyTitle", { name }),
            "twitter:description": $lang.getTranslation("seoPrivacyDescription", { name }),
            "twitter:image": "/images/privacy.jpg",
            icon: "/favicon_dc.jpg",
        },

        // SEO metadata for the terms and conditions page
        terms: {
            lang: $lang.locale,
            title: $lang.getTranslation("seoTermsTitle", { name }),
            description: $lang.getTranslation("seoTermsDescription", { name }),
            author: name,
            keywords: "Conditions Générales de Vente, Terms and Conditions, Legal Agreement, Accord légal, User Responsibilities, Responsabilités des utilisateurs, Payment Terms, Conditions de paiement, Service Terms, Conditions de service, Legal Compliance, Conformité légale",
            "og:title": $lang.getTranslation("seoTermsTitle", { name }),
            "og:description": $lang.getTranslation("seoTermsDescription", { name }),
            "og:type": "website",
            "og:url": "https://djason-chery.dev/terms",
            "og:image": "/images/terms.jpg",
            "twitter:card": "summary_large_image",
            "twitter:title": $lang.getTranslation("seoTermsTitle", { name }),
            "twitter:description": $lang.getTranslation("seoTermsDescription", { name }),
            "twitter:image": "/images/terms.jpg",
            icon: "/favicon_dc.jpg",
        },

        // SEO metadata for the legal information page
        legal: {
            lang: $lang.locale,
            title: $lang.getTranslation("seoLegalTitle", { name }),
            description: $lang.getTranslation("seoLegalDescription", { name }),
            author: name,
            keywords: "Mentions légales, Legal Mentions, Djason Chery, Éditeur du site, Hosting Provider, Propriété intellectuelle, Contact",
            "og:title": $lang.getTranslation("seoLegalTitle", { name }),
            "og:description": $lang.getTranslation("seoLegalDescription", { name }),
            "og:type": "website",
            "og:url": "https://djason-chery.dev/legal",
            "og:image": "/images/legal.jpg",
            "twitter:card": "summary_large_image",
            "twitter:title": $lang.getTranslation("seoLegalTitle", { name }),
            "twitter:description": $lang.getTranslation("seoLegalDescription", { name }),
            "twitter:image": "/images/legal.jpg",
            icon: "/favicon_dc.jpg",
        },

        // SEO metadata for the contact page
        refundPolicy: {
            lang: $lang.locale,
            title: $lang.getTranslation("seoRefundPolicyTitle", { name }),
            description: $lang.getTranslation("seoRefundPolicyDescription", { name }),
            author: name,
            keywords: "Refund Policy, Politique de remboursement, Service Refund, Politique de service, Payment Refund, Remboursement de paiement, User Rights, Droits des utilisateurs, Service Terms, Conditions de service, Legal Compliance, Conformité légale",
            "og:title": $lang.getTranslation("seoRefundPolicyTitle", { name }),
            "og:description": $lang.getTranslation("seoRefundPolicyDescription", { name }),
            "og:type": "website",
            "og:url": "https://djason-chery.dev/refund-policy",
            "og:image": "/images/refund.jpg",
            "twitter:card": "summary_large_image",
            "twitter:title": $lang.getTranslation("seoRefundPolicyTitle", { name }),
            "twitter:description": $lang.getTranslation("seoRefundPolicyDescription", { name }),
            "twitter:image": "/images/refund.jpg",
            icon: "/favicon_dc.jpg",
        },

        // SEO metadata for the contact page
        payMe: {
            lang: $lang.locale,
            title: $lang.getTranslation("seoPayMeTitle", { name }),
            description: $lang.getTranslation("seoPayMeDescription", { name }),
            author: name,
            keywords: "Pay Me, Paiement, Service Payment, Règlement, Transaction, Freelance Payment, Paiement Freelance, Payment Terms, Conditions de paiement, Secure Payment, Paiement sécurisé",
            "og:title": $lang.getTranslation("seoPayMeTitle", { name }),
            "og:description": $lang.getTranslation("seoPayMeDescription", { name }),
            "og:type": "website",
            "og:url": "https://djason-chery.dev/pay-me",
            "og:image": "/images/pay.jpg",
            "twitter:card": "summary_large_image",
            "twitter:title": $lang.getTranslation("seoPayMeTitle", { name }),
            "twitter:description": $lang.getTranslation("seoPayMeDescription", { name }),
            "twitter:image": "/images/pay.jpg",
            icon: "/favicon_dc.jpg",
        },
    };

    // Fallback metadata for pages without predefined configurations
    const meta = seoData[pageKey] || {
        lang: $lang.locale,
        title: $lang.getTranslation("defaultSeoTitle", { name }),
        description: $lang.getTranslation("defaultSeoDescription", { name }),
        icon: "/favicon_dc.jpg",
    };

    // Inject SEO metadata into the page using Nuxt's useSeoMeta utility
    useSeoMeta({
        htmlAttrs: {
            lang: meta.lang,
        },
        ...meta,
    });

    return meta;
};
