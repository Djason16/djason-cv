import { useHead, useRuntimeConfig, useSeoMeta } from "#imports";
import { withTrailingSlash } from "./pathHelpers";
import { personalInfo } from "./personalInfo";

// SEO configuration per page
const seoConfig = {
    index: {
        url: "",
        image: "/images/profile.jpg",
        keywords: "Djason Chery, Monteur Truquiste, Compositing Editor, VFX Editor, Post-Production Audiovisuelle, Audiovisual Post-Production, Développeur Full-Stack, Full-Stack Developer, Développement Web, Web Development, Réparation Informatique, Computer Repair, Conseil IT, IT Consulting, Portfolio Professionnel, Professional Portfolio, CV en ligne, Online CV, Solutions Créatives, Creative Solutions, Expert Technique, Technical Expert"
    },
    privacy: {
        url: "/privacy",
        image: "/images/privacy.jpg",
        keywords: "Politique de confidentialité, Privacy Policy, Protection des données, Data Protection, RGPD, GDPR Compliance, Sécurité des données, Data Security, Vie privée en ligne, Online Privacy, Confidentialité client, Client Confidentiality, Protection informations personnelles, Personal Information Protection, Cookies, Données sensibles, Sensitive Data"
    },
    terms: {
        url: "/terms",
        image: "/images/terms.jpg",
        keywords: "Conditions Générales de Vente, Terms and Conditions, CGV, T&C, Contrat de service, Service Agreement, Droits d'auteur, Copyright, Responsabilité, Liability, Modalités de paiement, Payment Terms, Conditions utilisation, Usage Terms, Services audiovisuels, Audiovisual Services, Services web, Web Services, Services informatiques, IT Services"
    },
    legal: {
        url: "/legal",
        image: "/images/legal.jpg",
        keywords: "Mentions légales, Legal Mentions, Djason Chery, Éditeur du site, Website Publisher, Hébergeur, Hosting Provider, Propriété intellectuelle, Intellectual Property, Informations légales, Legal Information, SIRET, Contact professionnel, Professional Contact, Responsable publication, Publication Manager"
    },
    refundPolicy: {
        url: "/refund-policy",
        image: "/images/refund.jpg",
        keywords: "Politique de remboursement, Refund Policy, Remboursement services, Service Refund, Garantie, Guarantee, Annulation, Cancellation, Délai remboursement, Refund Deadline, Conditions remboursement, Refund Conditions, Droits consommateur, Consumer Rights, Services audiovisuels, Audiovisual Services, Services web, Web Services, Services IT, IT Services"
    },
    payMe: {
        url: "/pay-me",
        image: "/images/pay.jpg",
        keywords: "Paiement en ligne, Online Payment, Paiement sécurisé, Secure Payment, Stripe, Paiement carte bancaire, Credit Card Payment, Règlement, Transaction, Facturation, Invoicing, Paiement services, Service Payment, Montage vidéo, Video Editing, Développement web, Web Development, Réparation informatique, Computer Repair, Freelance Payment, Paiement prestations, Payment Services"
    },
    login: {
        url: "/login",
        image: "/images/login.jpg",
        keywords: "Connexion, Login, Authentification, Authentication, Espace client, Client Area, Espace administration, Admin Area, Gestion clients, Client Management, Base de données clients, Client Database, Contrats, Contracts, Devis, Quotes, Factures, Invoices, Accès sécurisé, Secure Access, Dashboard, Tableau de bord",
        noIndex: true
    },
    admin: {
        url: "/admin",
        image: "/images/admin.jpg",
        keywords: "Administration, Administration Panel, Tableau de bord, Dashboard, Gestion clients, Client Management, Gestion projets, Project Management, Facturation, Invoicing, Devis, Quotes, Contrats, Contracts, Base de données, Database, Statistiques, Statistics, Espace sécurisé, Secure Area, Gestion freelance, Freelance Management, CRM, Backend",
        noIndex: true
    }
};

// Generate SEO metadata for a page
export const seoMetaData = (pageKey, $lang) => {
    const { name } = personalInfo
    const baseUrl = useRuntimeConfig().public.frontendDomain
    const { url = "", image = "/favicon_dc.jpg", keywords = `${name}, Portfolio, Web Developer`, noIndex = false } = seoConfig[pageKey] || {}

    const fullUrl = withTrailingSlash(`${baseUrl}${url}`)
    const robotsContent = noIndex ? "noindex, nofollow" : "index, follow"
    const keyCap = pageKey.charAt(0).toUpperCase() + pageKey.slice(1)
    const title = $lang.getTranslation(pageKey === "index" ? "seoIndexTitle" : `seo${keyCap}Title`, { name })
    const description = $lang.getTranslation(pageKey === "index" ? "seoIndexDescription" : `seo${keyCap}Description`, { name })

    const meta = {
        title,
        description,
        author: name,
        publisher: name,
        keywords,
        robots: robotsContent,
        htmlAttrs: $lang.locale.value,
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

    useSeoMeta(meta);
    useHead({
        link: [{ rel: "canonical", href: fullUrl }]
    });

    return meta;
};