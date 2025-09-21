import { useRuntimeConfig, useSeoMeta } from "#imports";
import { personalInfo } from "./personalInfo";

// SEO configuration per page
const seoConfig = {
    index: { url: "", image: "/images/profile.jpg", keywords: "Djason Chery, Portfolio, Full-Stack Developer, Développeur Full-Stack, Web Development, Développement Web, Creative Solutions, Solutions Créatives, Expert Post-Production, Expert en Post-Production, CV en ligne, Online CV, Profil Professionnel, Digital Skills, Compétences Numériques" },
    privacy: { url: "/privacy", image: "/images/privacy.jpg", keywords: "Privacy Policy, Politique de confidentialité, Data Security, Sécurité des données, User Information Protection, Protection des informations utilisateur, Online Privacy, Vie privée en ligne, GDPR Compliance, Conformité RGPD, Legal Terms, Mentions légales" },
    terms: { url: "/terms", image: "/images/terms.jpg", keywords: "Conditions Générales de Vente, Terms and Conditions, Legal Agreement, Accord légal, User Responsibilities, Responsabilités des utilisateurs, Payment Terms, Conditions de paiement, Service Terms, Conditions de service, Legal Compliance, Conformité légale" },
    legal: { url: "/legal", image: "/images/legal.jpg", keywords: "Mentions légales, Legal Mentions, Djason Chery, Éditeur du site, Hosting Provider, Propriété intellectuelle, Contact" },
    refundPolicy: { url: "/refund-policy", image: "/images/refund.jpg", keywords: "Refund Policy, Politique de remboursement, Service Refund, Politique de service, Payment Refund, Remboursement de paiement, User Rights, Droits des utilisateurs, Service Terms, Conditions de service, Legal Compliance, Conformité légale" },
    payMe: { url: "/pay-me", image: "/images/pay.jpg", keywords: "Pay Me, Paiement, Service Payment, Règlement, Transaction, Freelance Payment, Paiement Freelance, Payment Terms, Conditions de paiement, Secure Payment, Paiement sécurisé" }
};

// Ensure URLs end with a trailing slash
const withTrailingSlash = (url) => url.endsWith("/") ? url : url + "/";

// Generate SEO metadata for a page
export const seoMetaData = (pageKey, $lang) => {
    const { name } = personalInfo;
    const baseUrl = useRuntimeConfig().public.frontendDomain;

    const { url = "", image = "/favicon_dc.jpg", keywords = `${name}, Portfolio, Web Developer` } = seoConfig[pageKey] || {};
    const keyCap = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);

    const title = $lang.getTranslation(pageKey === "index" ? "seoIndexTitle" : `seo${keyCap}Title`, { name });
    const description = $lang.getTranslation(pageKey === "index" ? "seoIndexDescription" : `seo${keyCap}Description`, { name });
    const fullUrl = withTrailingSlash(`${baseUrl}${url}`);

    const meta = {
        lang: $lang.locale.value,
        title,
        description,
        author: name,
        keywords,
        "og:title": title,
        "og:description": description,
        "og:type": "website",
        "og:url": fullUrl,
        "og:image": image,
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": image,
        icon: "/favicon_dc.jpg"
    };

    useSeoMeta({ htmlAttrs: { lang: meta.lang }, ...meta });
    return meta;
};