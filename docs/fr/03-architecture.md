<p align="center"><img src="../assets/docs-fr.png" alt="Documentation" width="100%" /></p>

# 03 — Architecture

**DOC-03** &nbsp;·&nbsp; [← Documentation](README.md)

Un seul projet Nuxt 4 dans `frontend/` : le site (Vue) et l'API (Nitro) sont construits et mis en ligne ensemble, avec un seul serveur.
Les dossiers et les rôles suivent les conventions de [DC Scaffold](https://github.com/Djason16/dc-scaffold).

## 01 — Dossiers

```
frontend/
├── assets/css/          main.css importe base/ (global, typographie), utils/ (variables) et
│                        components/ (un <nom-en-kebab>.css par composant, ex. hero-button.css pour HeroButton.vue)
├── components/
│   ├── layout/          AppShell (loader, en-tête, pied de page, bandeau cookies, langue), Header (avec MobileMenu, le menu plein écran), Footer
│   ├── ui/              éléments réutilisables : Button (HeroButton, IconButton, ToolCard), Form (FormInput), Image (AppImage), Modal, Table, SectionLayout, Loader, PreferencesBanner (cookies),
│   │                    List (CustomList), Message, Nav, Toast, Dialog
│   └── views/           contenu de chaque page (pages/*.vue affichent juste leur vue et appellent useSeo)
│       ├── Index/       sections de l'accueil
│       ├── Admin/       page admin et ses fenêtres
│       ├── Documents/   modèles PDF : BillingDocument (devis / facture), ContractContainer (contrat)
│       └── Legal/, Privacy/, Terms/, RefundPolicy/, Login/, PayMe/, NotFound/ (page d'erreur)
├── composables/         état réactif et appels à l'API : useAuth, useClients, useMissions, useProjects, useSkills, useAutoTranslate, useCalendar,
│                        useUnavailability, useInterestRates, useEnv, useMessage, useLang, useSeo, useSite
├── middleware/          gardes des pages : auth (admin), guest (connexion), slash final des adresses
├── pages/               un fichier par page (le nom du fichier est l'adresse)
├── plugins/             lang.ts (lu avec useLang()) + translations/ (français et anglais)
├── stores/              Pinia, actions dans stores/actions/ : userPreferences (bandeau cookies), siteSettings (mes infos),
│                        adminData (listes partagées par les fenêtres de l'admin), dialog (dialogues et notifications)
├── utils/               fonctions simples : api.ts (client de l'API), billing.ts (montants des devis et factures), contractDocument.ts, documents.ts, numbering.ts, pdf.ts + pdfRender.ts + pdfFonts.ts (PDF téléchargé), seo.ts...
├── data/                projets, services et compétences de l'accueil
├── server/
│   ├── api/[...path].ts       routeur de tous les contrôleurs (vérification de session incluse)
│   ├── api/index.get.ts       GET /api
│   ├── api/upload/            GET /api/upload/images/... (images envoyées)
│   ├── controllers/           un *Controller.ts par ressource = les routes de l'API
│   ├── utils/                 base de DC Scaffold : Controller, RequestHelper, ResponseHelper, DatabaseHelper, RouteDiscovery, SecurityHelper
│   ├── helpers/               helpers du site : DatabaseSchema, SessionHelper, RateLimitHelper, MailHelper, StripeHelper, EnvHelper, UploadHelper
│   ├── middleware/            redirect-www.ts, security.ts (en-têtes de sécurité de chaque réponse)
│   ├── plugins/               init-database.ts (tables, lignes par défaut, compte admin), qualif.ts
│   └── templates/             MailLayout, MailTemplates (e-mails), StripePages (pages de résultat du paiement)
└── nuxt.config.ts
```

## 02 — Technologies

| Catégorie | Technologie | Version |
| --------- | ----------- | ------- |
| Framework | Nuxt 4 (Vue 3) | 4.4.8 / 3.5.38 |
| Serveur | Nitro | intégré à Nuxt |
| État | Pinia | 3.0.4 |
| Styles | CSS 3, directive v-reveal (plugins/reveal.ts), @fontsource (Archivo, Barlow Condensed) | |
| Icônes | Font Awesome | 7.2.0 |
| SEO | @nuxtjs/sitemap 8, @nuxtjs/robots 6 | |
| Paiements | Stripe API | 22.2.1 |
| Base de données | MySQL (mysql2), phpMyAdmin | 8.4 en local (Docker) |
| E-mail | Nodemailer | 9.0.3 |
| Hébergement | Infomaniak | |

## 03 — Conventions

- **Un composant = un dossier** dans `components/`, son style dans `assets/css/components/<nom-en-kebab>.css`
- **Pages légères** : `pages/terms.vue` affiche seulement `components/views/Terms/Terms.vue` et appelle `useSeo('terms')`
- **Pas de fichier de plus de 300 lignes** : découpe-le en composants ou helpers plus petits
- **Commentaires en anglais**, courts : un en-tête par fichier, puis une phrase avant chaque bloc qui n'est pas évident
- **Tous les textes sont traduits** : aucun texte écrit en dur dans un composant (voir [Le site](04-le-site.md))
- **Données chargées une seule fois** : les listes de l'admin (clients, missions, services, taux) sont dans `stores/adminData.ts` et partagées par toutes les fenêtres ; la session est vérifiée une fois par chargement de page (`useAuth().checkAuth()`) ; les projets de l'accueil et **mes infos** (`stores/siteSettings.ts`, lues avec `useSite()`) sont chargés par le serveur pour la première page puis réutilisés par le navigateur ; chaque page est rendue par le serveur à chaque visite, donc les changements apparaissent sans refaire de build
- **Données à jour, rechargées seulement quand elles changent** : chaque écriture ajoute 1 à la version de sa table (`dc_versions`, `server/utils/DatabaseHelper.ts`). Le navigateur demande ces versions toutes les 30 s tant que l'onglet est affiché, et tout de suite quand tu y reviens (`GET /api/versions`, `utils/liveData.ts`). Il recharge seulement les listes dont la table a changé : un changement fait dans un autre onglet, un paiement Stripe ou les tâches automatiques apparaît sans recharger la page. Ses propres changements ne sont pas rechargés (le serveur indique quelles tables une requête a écrites : `X-Data-Versions`), et rien n'est rechargé pendant que tu tapes dans un champ. Une nouvelle liste : un `watchData` dans `plugins/live-data.client.ts`, ou `onDataChange` dans son composant (`composables/useLiveData.ts`)
- **Chaque appel à l'API passe par `utils/api.ts`** (voir [L'API](05-l-api.md))
- **Config TypeScript** : `tsconfig.json` utilise les références de projet de Nuxt 4 (app, server, shared, node)
- **Tout en TypeScript** : tous les fichiers sont en `.ts` et tous les composants en `<script setup lang="ts">` ; `npm run typecheck` (`nuxt typecheck`) doit rester à zéro erreur

---

<p align="center"><sub><a href="02-configuration.md">← 02 — Configuration</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="04-le-site.md">04 — Le site →</a></sub></p>
