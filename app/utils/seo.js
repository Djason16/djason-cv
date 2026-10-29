import { useHead, useRuntimeConfig } from "#imports";
import { withTrailingSlash } from './pathHelpers.js';

// SEO of every page: seoConfig below, seoMetaData() builds the <head> of one page (composables/useSeo.js)

const YEAR = new Date().getFullYear()

// <head> of each page: address, image, indexing (titles and descriptions in plugins/translations/common/seo.js)
const seoConfig = {
    notFound: {
        url: "",
        image: "/images/error.jpg",
        noIndex: true
    },
    serverError: {
        url: "",
        image: "/images/error.jpg",
        noIndex: true
    },
    index: {
        url: "",
        image: "/images/profile.jpg",
        keywords: `Djason Chery, développeur web full-stack, développeur web freelance, création site web sur mesure, développement web, SEO, AEO, post-production audiovisuelle, effets visuels, compositing, montage vidéo, services informatiques, réparation informatique, full-stack web developer, custom website development, video editing, visual effects, IT support, ${YEAR}`
    },
    privacy: {
        url: "/privacy",
        image: "/images/privacy.jpg",
        keywords: `politique de confidentialité, protection des données, RGPD, confidentialité site web, privacy policy, personal data protection, GDPR, website privacy, ${YEAR}`
    },
    terms: {
        url: "/terms",
        image: "/images/terms.jpg",
        keywords: `conditions générales de vente, conditions d’utilisation, prestations web, prestations audiovisuelles, terms and conditions, web services terms, audiovisual services terms, ${YEAR}`
    },
    legal: {
        url: "/legal",
        image: "/images/legal.jpg",
        keywords: `mentions légales, informations légales, éditeur du site, hébergeur, propriété intellectuelle, legal notice, website legal information, hosting provider, intellectual property, ${YEAR}`
    },
    refundPolicy: {
        url: "/refund-policy",
        image: "/images/refund.jpg",
        keywords: `politique de remboursement, remboursement prestations web, remboursement prestations audiovisuelles, refund policy, web services refund, audiovisual services refund, ${YEAR}`
    },
    payMe: {
        url: "/pay-me",
        image: "/images/pay.jpg",
        keywords: `paiement sécurisé, Stripe, règlement prestation, paiement en ligne, secure payment, online payment, Stripe payment, ${YEAR}`
    },
    login: {
        url: "/login",
        image: "/images/login.jpg",
        keywords: `connexion administration, espace administrateur, authentification sécurisée, admin login, secure authentication, dashboard access, ${YEAR}`,
        noIndex: true
    },
    admin: {
        url: "/admin",
        image: "/images/admin.jpg",
        keywords: `administration site, tableau de bord, gestion de contenu, site administration, admin dashboard, content management, ${YEAR}`,
        noIndex: true
    }
}

// Generates SEO metadata for a page ("site" = useSite(), like the buildSeo of DC Scaffold (https://github.com/Djason16/dc-scaffold))
export const seoMetaData = (pageKey, lang, site) => {
    const { name, url: baseUrl, email, phone } = site
    const { legalTva: tvaNumber, linkedin, github, malt, instagram } = useRuntimeConfig().public

    const {
        url = "",
        image = "/favicon_dc.jpg",
        keywords = lang.current.value === "en"
            ? `Djason Chery, full-stack web developer, freelance developer, custom website development, SEO, AEO, audiovisual post-production, visual effects, compositing, video editing, IT support, ${YEAR}`
            : `Djason Chery, développeur web full-stack, développeur freelance, création site web sur mesure, SEO, AEO, post-production audiovisuelle, effets visuels, compositing, montage vidéo, assistance informatique, ${YEAR}`,
        noIndex = false
    } = seoConfig[pageKey] || {}

    // Title and description of the page in the current language
    const locale = lang.current.value
    const keyCap = pageKey.charAt(0).toUpperCase() + pageKey.slice(1)
    const title = lang.getTranslation(
        pageKey === "index" ? "seoIndexTitle" : `seo${keyCap}Title`,
        { name }
    )
    const description = lang.getTranslation(
        pageKey === "index" ? "seoIndexDescription" : `seo${keyCap}Description`,
        { name }
    )

    // One address per page: English is a switch on the same page, not another address (no /en/ pages)
    const pageUrl = withTrailingSlash(`${baseUrl}${url}`)

    // Pages hidden from search engines: errors, login, admin
    const robotsContent = noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"

    const socialImage = `${baseUrl}${image}`

    // Structured data (schema.org) read by Google: the business behind the site
    const professionalServiceSchema = {
        "@context": "https://schema.org",
        "@type": "ProfessionalService",
        "@id": `${baseUrl}/#professional-service`,
        name,
        url: baseUrl,
        image: socialImage,
        description,
        telephone: phone,
        email,
        priceRange: "€€",
        areaServed: {
            "@type": "Country",
            name: "France"
        },
        address: {
            "@type": "PostalAddress",
            addressLocality: "Thourotte",
            addressRegion: "Hauts-de-France",
            addressCountry: "FR"
        },
        sameAs: [linkedin, github, malt, instagram].filter(Boolean),
        serviceType: [
            "Web Development",
            "SEO",
            "AEO",
            "Video Editing",
            "Visual Effects",
            "Audiovisual Post-Production",
            "IT Support"
        ],
        contactPoint: {
            "@type": "ContactPoint",
            telephone: phone,
            email,
            contactType: "customer service",
            availableLanguage: ["fr", "en"]
        }
    }

    if (tvaNumber) {
        professionalServiceSchema.taxID = tvaNumber
        professionalServiceSchema.vatID = tvaNumber
    }

    // Structured data of the page itself
    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title,
        url: pageUrl,
        description,
        inLanguage: locale,
        isPartOf: {
            "@type": "WebSite",
            name,
            url: baseUrl
        }
    }

    // Meta tags: description, Open Graph and Twitter cards
    const meta = {
        title,
        description,
        author: name,
        publisher: name,
        keywords,
        robots: robotsContent,
        htmlAttrs: { lang: locale },
        "og:title": title,
        "og:description": description,
        "og:type": "website",
        "og:url": pageUrl,
        "og:image": socialImage,
        "og:image:width": "1200",
        "og:image:height": "630",
        "og:image:alt": title,
        "og:site_name": name,
        "og:locale": locale === "en" ? "en_US" : "fr_FR",
        "og:locale:alternate": locale === "en" ? "fr_FR" : "en_US",
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": socialImage,
        "twitter:image:alt": title,
        charset: "utf-8",
        viewport: "width=device-width, initial-scale=1",
        "format-detection": "telephone=no",
        icon: "/favicon_dc.jpg",
        "apple-touch-icon": "/favicon_dc.jpg"
    }

    // Canonical address and structured data in the <head>
    useHead({
        link: [
            { rel: "canonical", href: pageUrl }
        ],
        script: [
            {
                type: "application/ld+json",
                children: JSON.stringify(professionalServiceSchema)
            },
            !noIndex
                ? {
                    type: "application/ld+json",
                    children: JSON.stringify(webPageSchema)
                }
                : null
        ].filter(Boolean)
    })

    // Returns meta only — useSeoMeta is called from the page
    return meta
}