# 3. Architecture

[← Documentation](README.md)

One Nuxt 4 project in `app/`: the site (Vue) and the API (Nitro) are built and deployed together, with one server.
The folders and responsibilities follow the [DC Scaffold](https://github.com/Djason16/dc-scaffold) conventions.

## Folders

```
app/
├── assets/css/          main.css imports base/ (global, typography), utils/ (variables) and
│                        components/ (one <kebab-name>.css per component, e.g. hero-button.css for HeroButton.vue)
├── components/
│   ├── layout/          AppShell (loader, header, footer, cookie banner, language), Header, Footer
│   ├── ui/              reusable pieces: Button, Modal, Table, SectionLayout, Loader, PreferencesBanner (cookies),
│   │                    Animation, Carousel, List, Message, Nav
│   └── views/           content of each page (pages/*.vue only display their view and call useSeo)
│       ├── Index/       sections of the home page
│       ├── Admin/       admin page and its modals
│       ├── Documents/   PDF templates: DocumentContainer (quote / invoice), ContractContainer (contract)
│       └── Legal/, Privacy/, Terms/, RefundPolicy/, Login/, PayMe/, NotFound/ (error page)
├── composables/         reactive state and API calls: useAuth, useClients, useMissions, useProjects, useCalendar,
│                        useUnavailability, useInterestRates, useEnv, useDocuments, useMessage, useLang, useSeo, useSite
├── middleware/          page guards: auth (admin), guest (login), trailing slash redirect
├── pages/               one file per page (the file name is the address)
├── plugins/             lang.js (read with useLang()) + translations/ (French and English)
├── stores/              Pinia: userPreferences (cookie banner) + actions/, adminData (lists shared by the admin modals)
├── utils/               plain functions: api.js (API client), documents.js, documentChecks.js, pdf.js, seo.js...
├── data/                static projects, services and skills of the home page
├── server/
│   ├── api/[...path].js       router of every controller (session check included)
│   ├── api/index.get.js       GET /api
│   ├── api/upload/            GET /api/upload/images/... (uploaded images)
│   ├── controllers/           one *Controller.js per resource = the API routes
│   ├── helpers/               ResponseHelper, RequestHelper, DatabaseHelper, Controller, RouteDiscovery, DatabaseSchema,
│   │                          SessionHelper, RateLimitHelper, MailHelper, StripeHelper, EnvHelper, UploadHelper
│   ├── plugins/               init-database.js (tables, default rows, admin account)
│   └── templates/             MailLayout, MailTemplates (emails), StripePages (payment result pages)
└── nuxt.config.ts
```

## Tech stack

| Category | Technology | Version |
| -------- | ---------- | ------- |
| Framework | Nuxt 4 (Vue 3) | 4.4.8 / 3.5.38 |
| Server | Nitro | built into Nuxt |
| State | Pinia | 3.0.4 |
| Styles | CSS 3, GSAP | 3.15.0 |
| Icons | Font Awesome | 7.2.0 |
| Images, SEO | @nuxt/image 2, @nuxtjs/sitemap 8, @nuxtjs/robots 6 | |
| Payments | Stripe API | 22.2.1 |
| Database | SQLite (`node:sqlite`) | built into Node.js |
| Email | Nodemailer | 9.0.3 |
| Hosting | Infomaniak | |

## Conventions

- **One component = one folder** in `components/`, its styles in `assets/css/components/<kebab-name>.css`
- **Pages stay thin**: `pages/about.vue` only shows `components/views/About/About.vue` and calls `useSeo('about')`
- **No file over 300 lines**: split it into smaller components or helpers
- **Comments in English**, short: a header per file, then one sentence before each block that is not obvious
- **Every text is translated**: no text written directly in a component (see [The site](04-site.md))
- **Data loaded once**: the admin lists (clients, missions, services, rates) live in `stores/adminData.js` and are shared by every modal; the session is checked once per page load (`useAuth().checkAuth()`); the projects of the home page are loaded by the server and reused by the browser (`callOnce`)
- **Every API call goes through `utils/api.js`** (see [The API](05-api.md))
- **TypeScript config**: `tsconfig.json` uses the Nuxt 4 project references (app, server, shared, node)
