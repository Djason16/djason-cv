# 3. Architecture

[← Documentation](README.md)

Un seul projet Nuxt 4 dans `app/` : le site (Vue) et l'API (Nitro) sont construits et mis en ligne ensemble, avec un seul serveur.
Les dossiers et les rôles suivent les conventions de [DC Scaffold](https://github.com/Djason16/dc-scaffold).

## Dossiers

```
app/
├── assets/css/          main.css importe base/ (global, typographie), utils/ (variables) et
│                        components/ (un <nom-en-kebab>.css par composant, ex. hero-button.css pour HeroButton.vue)
├── components/
│   ├── layout/          AppShell (loader, en-tête, pied de page, bandeau cookies, langue), Header, Footer
│   ├── ui/              éléments réutilisables : Button, Modal, Table, SectionLayout, Loader, PreferencesBanner (cookies),
│   │                    Animation, Carousel, List, Message, Nav
│   └── views/           contenu de chaque page (pages/*.vue affichent juste leur vue et appellent useSeo)
│       ├── Index/       sections de l'accueil
│       ├── Admin/       page admin et ses fenêtres
│       ├── Documents/   modèles PDF : DocumentContainer (devis / facture), ContractContainer (contrat)
│       └── Legal/, Privacy/, Terms/, RefundPolicy/, Login/, PayMe/, NotFound/ (page d'erreur)
├── composables/         état réactif et appels à l'API : useAuth, useClients, useMissions, useProjects, useCalendar,
│                        useUnavailability, useInterestRates, useEnv, useDocuments, useMessage, useLang, useSeo, useSite
├── middleware/          gardes des pages : auth (admin), guest (connexion), slash final des adresses
├── pages/               un fichier par page (le nom du fichier est l'adresse)
├── plugins/             lang.js (lu avec useLang()) + translations/ (français et anglais)
├── stores/              Pinia : userPreferences (bandeau cookies) + actions/, adminData (listes partagées par les fenêtres de l'admin)
├── utils/               fonctions simples : api.js (client de l'API), documents.js, documentChecks.js, pdf.js, seo.js...
├── data/                projets, services et compétences de l'accueil
├── server/
│   ├── api/[...path].js       routeur de tous les contrôleurs (vérification de session incluse)
│   ├── api/index.get.js       GET /api
│   ├── api/upload/            GET /api/upload/images/... (images envoyées)
│   ├── controllers/           un *Controller.js par ressource = les routes de l'API
│   ├── helpers/               ResponseHelper, RequestHelper, DatabaseHelper, Controller, RouteDiscovery, DatabaseSchema,
│   │                          SessionHelper, RateLimitHelper, MailHelper, StripeHelper, EnvHelper, UploadHelper
│   ├── plugins/               init-database.js (tables, lignes par défaut, compte admin)
│   └── templates/             MailLayout, MailTemplates (e-mails), StripePages (pages de résultat du paiement)
└── nuxt.config.ts
```

## Technologies

| Catégorie | Technologie | Version |
| --------- | ----------- | ------- |
| Framework | Nuxt 4 (Vue 3) | 4.4.8 / 3.5.38 |
| Serveur | Nitro | intégré à Nuxt |
| État | Pinia | 3.0.4 |
| Styles | CSS 3, GSAP | 3.15.0 |
| Icônes | Font Awesome | 7.2.0 |
| Images, SEO | @nuxt/image 2, @nuxtjs/sitemap 8, @nuxtjs/robots 6 | |
| Paiements | Stripe API | 22.2.1 |
| Base de données | SQLite (`node:sqlite`) | intégré à Node.js |
| E-mail | Nodemailer | 9.0.3 |
| Hébergement | Infomaniak | |

## Conventions

- **Un composant = un dossier** dans `components/`, son style dans `assets/css/components/<nom-en-kebab>.css`
- **Pages légères** : `pages/about.vue` affiche seulement `components/views/About/About.vue` et appelle `useSeo('about')`
- **Pas de fichier de plus de 300 lignes** : découpe-le en composants ou helpers plus petits
- **Commentaires en anglais**, courts : un en-tête par fichier, puis une phrase avant chaque bloc qui n'est pas évident
- **Tous les textes sont traduits** : aucun texte écrit en dur dans un composant (voir [Le site](04-le-site.md))
- **Données chargées une seule fois** : les listes de l'admin (clients, missions, services, taux) sont dans `stores/adminData.js` et partagées par toutes les fenêtres ; la session est vérifiée une fois par chargement de page (`useAuth().checkAuth()`) ; les projets de l'accueil sont dans le HTML pré-rendu (moteurs de recherche) et rechargés dans le navigateur, pour que les nouveaux apparaissent sans refaire de build
- **Chaque appel à l'API passe par `utils/api.js`** (voir [L'API](05-l-api.md))
- **Config TypeScript** : `tsconfig.json` utilise les références de projet de Nuxt 4 (app, server, shared, node)
