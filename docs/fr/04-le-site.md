# 4. Le site

[← Documentation](README.md)

## Textes et langues

Même système que [DC Scaffold](https://github.com/Djason16/dc-scaffold). Tous les textes sont dans `plugins/translations/` :

- `common/` : textes de tout le site (`common.js`), du bandeau cookies (`preferences.js`), du SEO (`seo.js`)
- `pages/` : un fichier par page, `pages/admin/` pour les fonctions de l'admin

Chaque fichier a un bloc `fr` et un bloc `en` avec les mêmes clés. Une clé n'existe que dans un seul fichier.

```js
// plugins/translations/pages/about.js
export default {
    fr: { aboutTitle: 'À propos' },
    en: { aboutTitle: 'About' },
}
```

```js
const { getTranslation: t } = useLang()   // dans <script setup>
{{ t('aboutTitle') }}                     // dans le template
t('footerText', { year, name })           // avec des valeurs : "{{year}}" dans le texte est remplacé
useLang().current.value                   // 'fr' ou 'en'
```

Un texte introuvable affiche sa clé, facile à repérer sur la page.
Un nouveau fichier s'importe dans `plugins/translations/translations.js` et s'ajoute à `TRANSLATIONS`.

La langue choisie avec les boutons FR / EN n'est gardée pour la prochaine visite **que si le visiteur a accepté les cookies fonctionnels**.

## Cookies (bandeau)

Le site n'a **ni statistiques, ni publicité, ni suivi**. Le bandeau (`components/ui/PreferencesBanner/`) propose :

| Catégorie | Refusable | Ce qu'elle couvre |
| --------- | --------- | ----------------- |
| Essentiels | Non | Navigation, choix du visiteur (`site_cookie_consent`, 180 jours), session admin |
| Sécurité | Non | Protection contre les accès non autorisés |
| Paiement | Non | Cookies déposés par Stripe pendant un paiement |
| Fonctionnels | Oui | Garde la langue pour la prochaine visite |

Son fonctionnement :

- **Tout accepter**, **Tout refuser**, ou **Personnaliser** pour cocher chaque catégorie, puis **Enregistrer**
- Changer de page sans choisir ferme le bandeau **pour cette visite seulement** : rien n'est enregistré (ce n'est pas un accord),
  les cookies facultatifs restent refusés et le bandeau revient à la prochaine visite
- **Gérer les cookies**, dans le pied de page, le rouvre sur le choix actuel

Le choix est dans `stores/userPreferences.js` (Pinia). Nom et durée du cookie : en haut de `stores/actions/userPreferencesActions.js`.

**Ajouter un outil externe** (statistiques, Google Maps, YouTube...) demande sa propre catégorie, sinon le site n'est plus conforme au RGPD :

1. dans `stores/userPreferences.js` : ajoute `maps: false` dans `preferences` et `maps: { required: false }` dans `categories`
2. dans `plugins/translations/common/preferences.js` : ajoute `mapsLabel` et `mapsDescription` dans les deux langues
3. dans le code : ne charge l'outil que si `userPreferences.preferences.maps` vaut `true`
4. mets à jour la section cookies de la politique de confidentialité (`plugins/translations/pages/privacy.js`, section 8)

## Styles

- **Couleurs, polices, tailles** : `assets/css/utils/variables.css` (`--first-color` à `--fifth-color`...). Change une valeur, tout le site suit
- **Tailles de texte** : `.text-small`, `.text-normal`, `.text-large`... dans `assets/css/base/typography.css`
- **Police** : Barlow Condensed, dans `public/fonts/`
- **Style d'un composant** : `assets/css/components/<nom-en-kebab>.css`, importé dans `assets/css/main.css`

## Cadre des pages (AppShell)

`components/layout/AppShell/AppShell.vue` entoure chaque page, page d'erreur comprise :
loader, en-tête, page, pied de page, boutons flottants (retour en haut, langues) et bandeau cookies.

- **En-tête** : `components/layout/Header/`
- **Pied de page** (réseaux sociaux, liens légaux, gestion des cookies, connexion) : `components/layout/Footer/`

## Ajouter une page

1. `components/views/About/About.vue` : le contenu (une section = un composant dans le même dossier)
2. `pages/about.vue` : affiche seulement `<About />` et appelle `useSeo('about')`. Le nom du fichier est l'adresse (`/about/`)
3. ses textes dans `plugins/translations/pages/about.js`, importé dans `translations.js`
4. son entrée SEO dans `utils/seo.js`, puis `seoAboutTitle` / `seoAboutDescription` dans `plugins/translations/common/seo.js`
5. son adresse dans `publicRoutes` de `nuxt.config.ts` (pré-rendu et sitemap)

## SEO

- Titre, description et image de partage de chaque page : `utils/seo.js` + `plugins/translations/common/seo.js`
- `sitemap.xml` et `robots.txt` sont créés à partir de `publicRoutes` et `privateRoutes` de `nuxt.config.ts`
- Les adresses finissent toujours par un slash (`withTrailingSlash()` dans `utils/pathHelpers.js`, `middleware/redirect.global.js`)
