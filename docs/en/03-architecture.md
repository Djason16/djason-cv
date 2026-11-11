<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 03 — Architecture

**DOC-03** &nbsp;·&nbsp; [← Documentation](README.md)

One Nuxt 4 project in `frontend/`: the site (Vue) and the API (Nitro) are built and deployed together, with one server.
The folders and responsibilities follow the [DC Scaffold](https://github.com/Djason16/dc-scaffold) conventions.

## 01 — Folders

```
frontend/
├── assets/css/          main.css imports base/ (global, typography), utils/ (variables) and
│                        components/ (one <kebab-name>.css per component, e.g. hero-button.css for HeroButton.vue)
├── components/
│   ├── layout/          AppShell (loader, header, footer, cookie banner, language), Header (with MobileMenu, the full screen menu), Footer
│   ├── ui/              reusable pieces: Button (HeroButton, IconButton, ToolCard), Form (FormInput), Image (AppImage), Modal, Table, SectionLayout, Loader, PreferencesBanner (cookies),
│   │                    List (CustomList), Message, Nav, Toast, Dialog
│   └── views/           content of each page (pages/*.vue only display their view and call useSeo)
│       ├── Index/       sections of the home page
│       ├── Admin/       admin page and its modals
│       ├── Documents/   PDF templates: BillingDocument (quote / invoice), ContractContainer (contract)
│       └── Legal/, Privacy/, Terms/, RefundPolicy/, Login/, PayMe/, NotFound/ (error page)
├── composables/         reactive state and API calls: useAuth, useClients, useMissions, useProjects, useSkills, useAutoTranslate, useCalendar,
│                        useUnavailability, useInterestRates, useEnv, useMessage, useLang, useSeo, useSite
├── middleware/          page guards: auth (admin), guest (login), trailing slash redirect
├── pages/               one file per page (the file name is the address)
├── plugins/             lang.ts (read with useLang()) + translations/ (French and English)
├── stores/              Pinia, actions in stores/actions/: userPreferences (cookie banner), siteSettings (my info),
│                        adminData (lists shared by the admin modals), dialog (dialogs and notifications)
├── utils/               plain functions: api.ts (API client), billing.ts (amounts of the quotes and invoices), contractDocument.ts, documents.ts, numbering.ts, pdf.ts + pdfRender.ts + pdfFonts.ts (PDF downloaded), seo.ts...
├── data/                static projects, services and skills of the home page
├── server/
│   ├── api/[...path].ts       router of every controller (session check included)
│   ├── api/index.get.ts       GET /api
│   ├── api/upload/            GET /api/upload/images/... (uploaded images)
│   ├── controllers/           one *Controller.ts per resource = the API routes
│   ├── utils/                 base of DC Scaffold: Controller, RequestHelper, ResponseHelper, DatabaseHelper, RouteDiscovery, SecurityHelper
│   ├── helpers/               helpers of the site: DatabaseSchema, SessionHelper, RateLimitHelper, MailHelper, StripeHelper, EnvHelper, UploadHelper
│   ├── middleware/            redirect-www.ts, security.ts (security headers of every answer)
│   ├── plugins/               init-database.ts (tables, default rows, admin account), qualif.ts
│   └── templates/             MailLayout, MailTemplates (emails), StripePages (payment result pages)
└── nuxt.config.ts
```

## 02 — Tech stack

| Category | Technology | Version |
| -------- | ---------- | ------- |
| Framework | Nuxt 4 (Vue 3) | 4.4.8 / 3.5.38 |
| Server | Nitro | built into Nuxt |
| State | Pinia | 3.0.4 |
| Styles | CSS 3, v-reveal directive (plugins/reveal.ts), @fontsource (Archivo, Barlow Condensed) | |
| Icons | Font Awesome | 7.2.0 |
| SEO | @nuxtjs/sitemap 8, @nuxtjs/robots 6 | |
| Payments | Stripe API | 22.2.1 |
| Database | MySQL (mysql2), phpMyAdmin | 8.4 locally (Docker) |
| Email | Nodemailer | 9.0.3 |
| Hosting | Infomaniak | |

## 03 — Conventions

- **One component = one folder** in `components/`, its styles in `assets/css/components/<kebab-name>.css`
- **Pages stay thin**: `pages/terms.vue` only shows `components/views/Terms/Terms.vue` and calls `useSeo('terms')`
- **No file over 300 lines**: split it into smaller components or helpers
- **Comments in English**, short: a header per file, then one sentence before each block that is not obvious
- **Every text is translated**: no text written directly in a component (see [The site](04-site.md))
- **Data loaded once**: the admin lists (clients, missions, services, rates) live in `stores/adminData.ts` and are shared by every modal; the session is checked once per page load (`useAuth().checkAuth()`); the projects of the home page and **my info** (`stores/siteSettings.ts`, read with `useSite()`) are loaded by the server for the first page and reused by the browser; every page is rendered by the server at each visit, so changes show up without a rebuild
- **Data kept fresh, loaded again only when it changed**: every write adds 1 to the version of its table (`dc_versions`, `server/utils/DatabaseHelper.ts`). The browser asks for these versions every 30 s while the tab is shown, and at once when you come back to it (`GET /api/versions`, `utils/liveData.ts`). It loads again only the lists whose table changed: a change from another tab, a Stripe payment or the automatic tasks shows up without reloading the page. Its own changes are not loaded again (the server tells which tables a request wrote: `X-Data-Versions`), and nothing is loaded while a field is being typed in. A new list: one `watchData` in `plugins/live-data.client.ts`, or `onDataChange` in its component (`composables/useLiveData.ts`)
- **Every API call goes through `utils/api.ts`** (see [The API](05-api.md))
- **TypeScript config**: `tsconfig.json` uses the Nuxt 4 project references (app, server, shared, node)
- **Full TypeScript**: every file is `.ts` and every component `<script setup lang="ts">`; `npm run typecheck` (`nuxt typecheck`) must stay at zero errors

---

<p align="center"><sub><a href="02-configuration.md">← 02 — Configuration</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="04-site.md">04 — The site →</a></sub></p>
