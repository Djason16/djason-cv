<p align="center"><img src="../assets/docs-en.png" alt="Documentation" width="100%" /></p>

# 04 — The site

**DOC-04** &nbsp;·&nbsp; [← Documentation](README.md)

## 01 — Texts and languages

Same system as [DC Scaffold](https://github.com/Djason16/dc-scaffold). Every text is in `plugins/translations/`:

- `common/`: texts of the whole site (`common.js`), the cookie banner (`preferences.js`), SEO (`seo.js`)
- `pages/`: one file per page, `pages/admin/` for the admin features

Each file has an `fr` and an `en` block with the same keys. A key exists in one file only.

```js
// plugins/translations/pages/about.js
export default {
    fr: { aboutTitle: 'À propos' },
    en: { aboutTitle: 'About' },
}
```

```js
const { getTranslation: t } = useLang()   // in <script setup>
{{ t('aboutTitle') }}                     // in the template
t('footerText', { year, name })           // with values: "{{year}}" in the text is replaced
useLang().current.value                   // 'fr' or 'en'
```

A missing text shows its key, easy to spot on the page.
A new file is imported in `plugins/translations/translations.js` and added to `TRANSLATIONS`.

The language chosen with the FR / EN buttons is remembered for the next visit **only if the visitor accepted functional cookies**.

## 02 — Cookies (banner)

The site has **no analytics, no advertising and no tracking**. The banner (`components/ui/PreferencesBanner/`) offers:

| Category | Can be refused | What it covers |
| -------- | -------------- | -------------- |
| Essential | No | Navigation, the visitor's choice (`site_cookie_consent`, 180 days), admin session |
| Security | No | Protection against unauthorized access |
| Payment | No | Cookies set by Stripe during a payment |
| Functional | Yes | Remembers the language for the next visit |

How it behaves:

- **Accept all**, **Deny all**, or **Customize** to tick each category, then **Save**
- Changing page without choosing closes the banner **for this visit only**: nothing is saved (this is not a consent),
  optional cookies stay off and the banner comes back on the next visit
- **Cookie settings** in the footer opens it again on the current choice

The choice lives in `stores/userPreferences.js` (Pinia). Cookie name and lifetime: top of `stores/actions/userPreferencesActions.js`.

**Adding an external tool** (analytics, Google Maps, YouTube...) needs its own category, otherwise the site is no longer GDPR compliant:

1. in `stores/userPreferences.js`: add `maps: false` to `preferences` and `maps: { required: false }` to `categories`
2. in `plugins/translations/common/preferences.js`: add `mapsLabel` and `mapsDescription` in both languages
3. in the code: only load the tool when `userPreferences.preferences.maps` is `true`
4. update the cookie section of the privacy policy (`plugins/translations/pages/privacy.js`, section 8)

## 03 — Styles

- **Colors, fonts, sizes**: `assets/css/utils/variables.css`. Public pages: ink grounds `--ink-900` / `--ink-800` / `--ink-700`, text `--paper` / `--paper-muted`, accent `--mint`; the admin and the PDF documents keep `--first-color` to `--fifth-color`. Change a value, the whole site follows
- **Text sizes**: only classes in the HTML, from `assets/css/base/typography.css`: `.text-display-xl` to `.text-display-xs` (titles), `.text-label` / `.eyebrow` (small spaced capitals), `.text-body-l` / `.text-body` / `.text-body-s` (texts); `.text-small` to `.text-xlarge` for the admin
- **Fonts**: two, self-hosted with @fontsource (`nuxt.config.ts`): Archivo Expanded (`--font-display`, titles, the letters of the logo) and Barlow Condensed (`--font-text` / `--font-label`, texts, labels, menus)
- **Margins**: `--page-gutter` on the left and right of the header, sections, text pages and footer; content never wider than 1320px
- **Sections**: colors given per section (`--fg`, `--fg-muted`, `--accent`, `--line`, `--panel`), see `section-layout.css` (home) and `page-layout.css` (text pages: OtherSectionLayout)
- **One component's style**: `assets/css/components/<kebab-name>.css`, imported in `assets/css/main.css`
- **Animations**: every duration and curve comes from `--motion-fast` / `--motion-base` / `--motion-slow` and `--ease`
  (`assets/css/utils/variables.css`, read in JS with `utils/motion.js`). Elements appear with `v-reveal` (`plugins/reveal.js`, `reveal.css`):
  they rise from below when they come on screen and leave when they go out of it (`--reveal-delay` staggers a list); nothing moves with reduced motion.
  Page changes are a simple fade (`app.pageTransition`) on an ink ground that stays (AppShell), with the loader (`Loader.vue`) on the first visit and on every page change.
- **Scroll bars**: thin, on the ink, in `base/global.css`
- **Motion settings**: every duration, distance, delay between items, hover lift and `will-change` is a variable of `utils/variables.css`
  (`--reveal-duration`, `--reveal-distance`, `--reveal-stagger`, `--swap-duration`, `--page-duration`, `--hover-lift`, `--will-change`);
  one rule of `base/global.css` gives `will-change` to every element that moves
- **Card grid**: `card-grid.css` (`.card-grid`, `.card-grid--large`, `.grid-card`) is shared by the skills, the projects and the admin tools
- **One animation per section, its header included** (`reveal.css`, `SectionHead` prop `reveal`): projects `'zoom-group'` + `'zoom'`, About me `'split'` + `'lift'` + `'slide'`, skills `'group'` + the default rise, services `'line'`, Contact `'drop'` + `'from-left'` + `'cascade'`
- **Online withdrawal** (`/withdrawal`, art. L.221-21 of the French Consumer Code since 19 June 2026): a form sent to `/api/withdrawals`, kept in `dc_withdrawals`, an acknowledgement emailed to the consumer at once and a notice to you; linked from the footer, the payment page, the terms and the refund policy
- **Consumer mediator**: admin → My info (name, address, website), printed in the terms; the admin shows a reminder while it is empty
- **Numbers of the lists**: `padIndex(i, 'PR')` of `utils/display.js` (`PR-01`, `02`...)
- **Payment**: the client pays exactly the amount asked, no card fee is added (forbidden for consumer cards, art. L.112-12 of the French monetary code) `will-change` only on elements that move (transform, opacity).
- **Photo of "About me"**: changed from admin → My info (saved at once, stored like the project images in `dc_uploads`); empty: `public/images/about-me.jpg`
- **No rounded corners** anywhere (the switches of the cookie banner, the availability dot and the loader stay round).
- **Texts**: the defaults are in `plugins/translations/`; the visitor texts, and those printed on the quotes, invoices and contracts (`billingDocument.js`, `contracts.js`), can be changed from admin → Site texts (`stores/siteTexts.js`, table `dc_texts`), one part of the site at a time. A French text saved there fills the English that was never changed by hand (machine translation, to check).
- **Skills**: the ones of `data/skills.js`, then the ones added from admin → Skills (table `dc_skills`, `composables/useSkills.js`), at the end of their category. They are also offered for the projects, which take any skill (typed and Enter)
- **Hover effects**: only with a mouse and a screen wider than 1024px. Write every `:hover` rule inside
  `@media (hover: hover) and (min-width: 1025px) { ... }`: nothing to cancel for phones and tablets

## 04 — App shell

`components/layout/AppShell/AppShell.vue` frames every page, the error page included:
loader, header, page, footer, floating buttons (back to top, languages) and cookie banner.

- **Header**: `components/layout/Header/`
- **Footer** (social links, legal links, cookie settings, login): `components/layout/Footer/`

## 05 — Adding a page

1. `components/views/About/About.vue`: the content (one section = one component in the same folder)
2. `pages/about.vue`: only displays `<About />` and calls `useSeo('about')`. The file name is the address (`/about/`)
3. its texts in `plugins/translations/pages/about.js`, imported in `translations.js`
4. its SEO entry in `utils/seo.js`, then `seoAboutTitle` / `seoAboutDescription` in `plugins/translations/common/seo.js`
5. its address in `publicRoutes` of `nuxt.config.ts` (sitemap)

## 06 — SEO

- Title, description and share image of each page: `utils/seo.js` + `plugins/translations/common/seo.js`
- `sitemap.xml` and `robots.txt` are generated from `publicRoutes` and `privateRoutes` of `nuxt.config.ts`
- Addresses always end with a slash (`withTrailingSlash()` in `utils/pathHelpers.js`, `middleware/redirect.global.js`)

## 07 — Emails

Every email follows the site (`server/templates/MailLayout.js`): its ink, mint links, the logo of the site online. Gmail and Outlook never load the fonts of a site: the **titles** are images drawn in Archivo (`public/images/mail/`, list and images in `server/templates/MailTitles.js`), put in the email itself (`cid:`, `MailHelper`): they show even before the site is online. The texts use a condensed font every device has. After changing or adding a title, draw them again:

```bash
npx -y -p playwright-core node scripts/mail-titles.mjs
```

`public/fonts/` holds the TrueType fonts of the PDF, of the Stripe result pages and of the title images (one file per weight, no copies).

---

<p align="center"><sub><a href="03-architecture.md">← 03 — Architecture</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="05-api.md">05 — The API →</a></sub></p>
