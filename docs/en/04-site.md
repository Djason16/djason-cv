# 4. The site

[← Documentation](README.md)

## Texts and languages

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

## Cookies (banner)

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

## Styles

- **Colors, fonts, sizes**: `assets/css/utils/variables.css` (`--first-color` to `--fifth-color`...). Change a value, the whole site follows
- **Text sizes**: `.text-small`, `.text-normal`, `.text-large`... in `assets/css/base/typography.css`
- **Font**: Barlow Condensed, in `public/fonts/`
- **One component's style**: `assets/css/components/<kebab-name>.css`, imported in `assets/css/main.css`

## App shell

`components/layout/AppShell/AppShell.vue` frames every page, the error page included:
loader, header, page, footer, floating buttons (back to top, languages) and cookie banner.

- **Header**: `components/layout/Header/`
- **Footer** (social links, legal links, cookie settings, login): `components/layout/Footer/`

## Adding a page

1. `components/views/About/About.vue`: the content (one section = one component in the same folder)
2. `pages/about.vue`: only displays `<About />` and calls `useSeo('about')`. The file name is the address (`/about/`)
3. its texts in `plugins/translations/pages/about.js`, imported in `translations.js`
4. its SEO entry in `utils/seo.js`, then `seoAboutTitle` / `seoAboutDescription` in `plugins/translations/common/seo.js`
5. its address in `publicRoutes` of `nuxt.config.ts` (pre-rendering and sitemap)

## SEO

- Title, description and share image of each page: `utils/seo.js` + `plugins/translations/common/seo.js`
- `sitemap.xml` and `robots.txt` are generated from `publicRoutes` and `privateRoutes` of `nuxt.config.ts`
- Addresses always end with a slash (`withTrailingSlash()` in `utils/pathHelpers.js`, `middleware/redirect.global.js`)
