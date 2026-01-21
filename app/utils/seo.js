import { useHead, useRuntimeConfig, useSeoMeta } from "#imports";
import { withTrailingSlash } from "./pathHelpers";

// SEO configuration per page - BILINGUAL (FR/EN)
const seoConfig = {
    index: {
        url: "",
        image: "/images/profile.jpg",
        keywords: "développeur web full stack Paris, développeur web Lyon, développeur web Marseille, développeur web Toulouse, développeur web Bordeaux, full stack developer France, création site web sur mesure Paris Île-de-France, custom website development, développeur full-stack freelance Grenoble Nice Montpellier, freelance full stack developer Nantes Strasbourg Lille, développement web professionnel Rennes Reims Toulon, professional web development, monteur truquiste VFX Paris, VFX editor compositing, video editing services France, post-production audiovisuelle Cannes Nîmes Perpignan, audiovisual post-production, montage vidéo professionnel Saint-Étienne Villeurbanne Limoges, professional video editing Poitiers Angoulême, VFX compositing France, services IT Boulogne-Billancourt Saint-Denis Versailles, IT consulting, réparation informatique Paris Lyon Marseille, computer repair France, Djason Chery, expert technique développement web, technical expert, solutions créatives numériques, creative digital solutions, développeur web Paris Île-de-France Auvergne-Rhône-Alpes, web developer France PACA Occitanie, freelance developer Nouvelle-Aquitaine, agence création site web toutes régions France, web agency, développement application web React Vue Angular, web application development Node.js, site web responsive mobile-first, responsive website design, e-commerce development Shopify WooCommerce, développement e-commerce PrestaShop, portfolio professionnel développeur, professional developer portfolio, services numériques transformation digitale, digital services, développeur JavaScript TypeScript, développeur Python PHP, solutions web innovantes 2026"
    },
    privacy: {
        url: "/privacy",
        image: "/images/privacy.jpg",
        keywords: "politique de confidentialité développeur web France, privacy policy web developer, protection des données RGPD 2026, data protection GDPR compliance, RGPD conformité site web, GDPR compliance France, confidentialité site web sécurisé, website privacy security, données personnelles clients, personal data protection, sécurité données chiffrement, data security encryption, politique confidentialité développeur web freelance Paris, web developer privacy policy France, protection informations clients projets web, client information protection, conformité RGPD développement web, GDPR compliance web development, données sensibles sécurisées, sensitive data security, confidentialité services audiovisuels montage vidéo, audiovisual services privacy, protection données clients montage vidéo VFX, video editing client data protection, sécurité données IT réparation informatique, IT data security, certificat SSL sécurité web, SSL certificate, protection vie privée utilisateurs, user privacy protection"
    },
    terms: {
        url: "/terms",
        image: "/images/terms.jpg",
        keywords: "conditions générales utilisation développeur web, terms and conditions web developer France, conditions d'utilisation site web, terms of use website, CGU site web professionnel, website terms service, contrat services web développement, web services contract development, droits d'auteur propriété intellectuelle, copyright intellectual property, responsabilité prestataire développeur, service provider liability developer, modalités paiement services web, payment terms web services, conditions générales vente prestations web, general terms of sale, termes services développement web application, web development service terms, accord utilisateur conditions contractuelles, user agreement, conditions services audiovisuels production vidéo, audiovisual services terms, contrat montage vidéo post-production, video editing contract, conditions services IT maintenance informatique, IT services terms, droits d'auteur contenu vidéo créatif, video content copyright, licence utilisation code source, source code license, garanties services numériques, digital services warranties"
    },
    legal: {
        url: "/legal",
        image: "/images/legal.jpg",
        keywords: "mentions légales développeur web France, legal notices web developer, informations légales site web professionnel, website legal information, éditeur site responsable publication, website publisher, hébergeur web serveur, web hosting provider, propriété intellectuelle droits auteur, intellectual property rights, responsable publication Djason Chery, publication manager, coordonnées entreprise freelance, company contact information, informations prestataire auto-entrepreneur, service provider information, données légales développeur freelance, developer legal information, SIRET numéro entreprise, SIRET number business, mentions légales services audiovisuels VFX, audiovisual services legal notices, informations légales montage vidéo production, video editing legal information, données légales services IT réparation, IT services legal information, RCS registre commerce, business registration, TVA intracommunautaire, VAT number, statut juridique micro-entreprise, legal status"
    },
    refundPolicy: {
        url: "/refund-policy",
        image: "/images/refund.jpg",
        keywords: "politique remboursement services web, refund policy web services France, remboursement développement web, web development refund, garantie satisfaction client développeur, satisfaction guarantee developer, annulation service prestation web, service cancellation web, délai remboursement 14 jours, refund deadline consumer rights, conditions remboursement projet web, refund conditions website project, droits consommateur services numériques, consumer rights digital services, remboursement développement web application, web application development refund, garantie projet web site internet, website project guarantee, politique retour annulation commande, return cancellation policy, remboursement services audiovisuels vidéo, audiovisual services refund, garantie montage vidéo post-production, video editing guarantee, remboursement services IT dépannage, IT services refund, annulation prestation développement, development service cancellation, remboursement acompte versé, deposit refund, politique satisfait ou remboursé, money-back guarantee"
    },
    payMe: {
        url: "/pay-me",
        image: "/images/pay.jpg",
        keywords: "paiement en ligne sécurisé développeur web, online payment web developer, paiement sécurisé Stripe, secure payment Stripe France, Stripe paiement carte bancaire, credit card payment Stripe, facturation services web développement, web services invoicing, devis création site web sur mesure, website creation quote, tarifs développement web freelance, web development rates freelance, paiement freelance développeur, freelance developer payment, règlement prestation services numériques, digital service settlement, transaction sécurisée SSL, secure transaction encryption, paiement services audiovisuels montage, audiovisual services payment, facturation montage vidéo VFX, video editing invoicing, tarifs services IT dépannage informatique, IT services rates, devis réparation informatique maintenance, computer repair quote, paiement montage truquiste post-production, video editing payment, paiement sécurisé 3D Secure, secure 3D payment, facture électronique automatique, electronic invoice, paiement échelonné plusieurs fois, installment payment, devis gratuit personnalisé, free custom quote"
    },
    login: {
        url: "/login",
        image: "/images/login.jpg",
        keywords: "connexion client espace personnel, client login area, authentification sécurisée 2FA, secure authentication, espace client suivi projet, client area project tracking, accès sécurisé tableau bord, secure dashboard access, gestion compte client développeur web, account management web developer, tableau de bord client projets, client dashboard projects, suivi projet web développement, website project tracking, espace personnel sécurisé, secure personal area, gestion projets audiovisuels vidéo, audiovisual projects management, suivi montage vidéo production, video editing tracking, connexion sécurisée chiffrée, encrypted secure login, portail client services web, client portal web services, authentification double facteur, two-factor authentication",
        noIndex: true
    },
    admin: {
        url: "/admin",
        image: "/images/admin.jpg",
        keywords: "administration site gestion, site administration management, tableau de bord admin développeur, admin dashboard developer, gestion projets web clients, web projects client management, gestion clients CRM, client management CRM, facturation automatique devis, automated invoicing quotes, devis contrats projets web, quotes contracts web projects, contrats services numériques, digital services contracts, statistiques analytics site, website statistics analytics, espace administration backend, administration backend area, gestion projets audiovisuels production, audiovisual projects production management, gestion montage vidéo pipeline, video editing pipeline management, gestion services IT tickets, IT services ticket management, rapports performance projets, project performance reports, analytics données clients, client data analytics, dashboard métriques KPI, metrics KPI dashboard",
        noIndex: true
    }
};

// Generate SEO metadata for a page
export const seoMetaData = (pageKey, $lang) => {
    const config = useRuntimeConfig();
    const name = config.public.name;
    const email = config.public.contactEmail;
    const phone = config.public.contactPhone;
    const tvaNumber = config.public.legalTva;
    const baseUrl = config.public.frontendDomain;
    const linkedin = config.public.linkedin;
    const github = config.public.github;
    const malt = config.public.malt;
    const instagram = config.public.instagram;
    const {
        url = "",
        image = "/favicon_dc.jpg",
        keywords = $lang.locale.value === 'en'
            ? "full stack developer France, web development Paris Lyon Marseille, video editing VFX compositing, IT services computer repair, freelance developer, custom website development, professional web services, digital solutions 2026"
            : "développeur full-stack France, développement web Paris Lyon Marseille Toulouse Bordeaux, montage vidéo VFX compositing, services IT réparation informatique, développeur freelance, création site web sur mesure, services web professionnels, solutions numériques 2026",
        noIndex = false
    } = seoConfig[pageKey] || {};

    const fullUrl = withTrailingSlash(`${baseUrl}${url}`);
    const robotsContent = noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    const keyCap = pageKey.charAt(0).toUpperCase() + pageKey.slice(1);
    const title = $lang.getTranslation(
        pageKey === "index" ? "seoIndexTitle" : `seo${keyCap}Title`,
        { name }
    );
    const description = $lang.getTranslation(
        pageKey === "index" ? "seoIndexDescription" : `seo${keyCap}Description`,
        { name }
    );

    const meta = {
        title,
        description,
        author: name,
        publisher: name,
        keywords,
        robots: robotsContent,
        htmlAttrs: { lang: $lang.locale.value },
        "og:title": title,
        "og:description": description,
        "og:type": "website",
        "og:url": fullUrl,
        "og:image": `${baseUrl}${image}`,
        "og:image:width": "400",
        "og:image:height": "400",
        "og:image:alt": title,
        "og:site_name": name,
        "og:locale": $lang.locale.value === 'en' ? "en_US" : "fr_FR",
        "og:locale:alternate": $lang.locale.value === 'en' ? "fr_FR" : "en_US",
        "twitter:card": "summary_large_image",
        "twitter:title": title,
        "twitter:description": description,
        "twitter:image": `${baseUrl}${image}`,
        "twitter:image:alt": title,
        charset: "utf-8",
        viewport: "width=device-width, initial-scale=1",
        "format-detection": "telephone=no",
        icon: "/favicon_dc.jpg",
        "apple-touch-icon": "/favicon_dc.jpg",
    };

    useSeoMeta(meta);

    useHead({
        link: [
            { rel: "canonical", href: fullUrl },
            { rel: "alternate", hreflang: "fr", href: fullUrl.replace(/\/en\//g, '/fr/').replace(/\/en$/g, '/fr') },
            { rel: "alternate", hreflang: "en", href: fullUrl.replace(/\/fr\//g, '/en/').replace(/\/fr$/g, '/en') },
            { rel: "alternate", hreflang: "x-default", href: fullUrl.replace(/\/(fr|en)\//g, '/fr/').replace(/\/(fr|en)$/g, '/fr') }
        ],
        script: [
            {
                type: "application/ld+json",
                children: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "ProfessionalService",
                    "name": name,
                    "image": `${baseUrl}${image}`,
                    "description": description,
                    "url": fullUrl,
                    "telephone": phone,
                    "email": email,
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": "Thourotte",
                        "addressCountry": "FR",
                        "addressRegion": "Hauts-de-France"
                    },
                    "taxID": tvaNumber,
                    "vatID": tvaNumber,
                    "areaServed": [
                        { "@type": "City", "name": "Paris" },
                        { "@type": "City", "name": "Lyon" },
                        { "@type": "City", "name": "Marseille" },
                        { "@type": "City", "name": "Toulouse" },
                        { "@type": "City", "name": "Bordeaux" },
                        { "@type": "City", "name": "Nice" },
                        { "@type": "City", "name": "Nantes" },
                        { "@type": "City", "name": "Strasbourg" },
                        { "@type": "City", "name": "Montpellier" },
                        { "@type": "City", "name": "Lille" },
                        { "@type": "City", "name": "Rennes" },
                        { "@type": "City", "name": "Reims" },
                        { "@type": "City", "name": "Grenoble" },
                        { "@type": "City", "name": "Saint-Étienne" },
                        { "@type": "City", "name": "Toulon" },
                        { "@type": "City", "name": "Cannes" },
                        { "@type": "City", "name": "Nîmes" },
                        { "@type": "City", "name": "Perpignan" },
                        { "@type": "City", "name": "Limoges" },
                        { "@type": "City", "name": "Poitiers" },
                        { "@type": "City", "name": "Angoulême" },
                        { "@type": "City", "name": "Villeurbanne" },
                        { "@type": "City", "name": "Boulogne-Billancourt" },
                        { "@type": "City", "name": "Saint-Denis" },
                        { "@type": "City", "name": "Versailles" },
                        { "@type": "Country", "name": "France" }
                    ],
                    "serviceType": [
                        "Web Development",
                        "Full Stack Development",
                        "Video Editing",
                        "VFX Compositing",
                        "IT Services",
                        "Computer Repair",
                        "E-commerce Development",
                        "Mobile Development"
                    ],
                    "priceRange": "€€",
                    "sameAs": [linkedin, github, malt, instagram],
                    "contactPoint": {
                        "@type": "ContactPoint",
                        "telephone": phone,
                        "email": email,
                        "contactType": "customer service",
                        "availableLanguage": ["French", "English"]
                    }
                })
            }
        ]
    });

    return meta;
};