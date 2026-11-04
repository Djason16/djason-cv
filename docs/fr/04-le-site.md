<p align="center"><img src="../assets/docs-fr.png" alt="Documentation" width="100%" /></p>

# 04 — Le site

**DOC-04** &nbsp;·&nbsp; [← Documentation](README.md)

## 01 — Textes et langues

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

## 02 — Cookies (bandeau)

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

## 03 — Styles

- **Couleurs, polices, tailles** : `assets/css/utils/variables.css`. Pages publiques : fonds encre `--ink-900` / `--ink-800` / `--ink-700`, texte `--paper` / `--paper-muted`, accent `--mint` ; l'admin et les documents PDF gardent `--first-color` à `--fifth-color`. Change une valeur, tout le site suit
- **Tailles de texte** : uniquement des classes dans le HTML, de `assets/css/base/typography.css` : `.text-display-xl` à `.text-display-xs` (titres), `.text-label` / `.eyebrow` (petites capitales espacées), `.text-body-l` / `.text-body` / `.text-body-s` (textes) ; `.text-small` à `.text-xlarge` pour l'admin
- **Polices** : deux, hébergées avec @fontsource (`nuxt.config.ts`) : Archivo Expanded (`--font-display`, titres, les lettres du logo) et Barlow Condensed (`--font-text` / `--font-label`, textes, libellés, menus)
- **Marges** : `--page-gutter` à gauche et à droite de l'en-tête, des sections, des pages de texte et du pied de page ; contenu jamais plus large que 1320 px
- **Sections** : couleurs données par section (`--fg`, `--fg-muted`, `--accent`, `--line`, `--panel`), voir `section-layout.css` (accueil) et `page-layout.css` (pages de texte : OtherSectionLayout)
- **Style d'un composant** : `assets/css/components/<nom-en-kebab>.css`, importé dans `assets/css/main.css`
- **Animations** : toutes les durées et la courbe viennent de `--motion-fast` / `--motion-base` / `--motion-slow` et `--ease`
  (`assets/css/utils/variables.css`, lues en JS par `utils/motion.js`). Les éléments apparaissent avec `v-reveal` (`plugins/reveal.js`, `reveal.css`) :
  ils montent depuis le bas en arrivant à l'écran et repartent quand ils en sortent (`--reveal-delay` décale une liste) ; rien ne bouge en mouvement réduit.
  Les changements de page sont un simple fondu (`app.pageTransition`) sur un fond encre qui reste en place (AppShell), avec le chargement (`Loader.vue`) à la première visite et à chaque changement de page.
- **Barres de défilement** : fines, sur l'encre, dans `base/global.css`
- **Réglages des animations** : chaque durée, distance, délai entre éléments, levée au survol et le `will-change` sont des variables de `utils/variables.css`
  (`--reveal-duration`, `--reveal-distance`, `--reveal-stagger`, `--swap-duration`, `--page-duration`, `--hover-lift`, `--will-change`) ;
  une seule règle de `base/global.css` donne le `will-change` à tout ce qui bouge
- **Grille de cartes** : `card-grid.css` (`.card-grid`, `.card-grid--large`, `.grid-card`) est partagée par les compétences, les projets et les outils de l'admin
- **Une animation par section, en-tête compris** (`reveal.css`, prop `reveal` de `SectionHead`) : projets `'zoom-group'` + `'zoom'`, Qui suis-je `'split'` + `'lift'` + `'slide'`, compétences `'group'` + la montée par défaut, services `'line'`, Contact `'drop'` + `'from-left'` + `'cascade'`
- **Rétractation en ligne** (`/withdrawal`, art. L.221-21 du Code de la consommation depuis le 19 juin 2026) : un formulaire envoyé à `/api/withdrawals`, gardé dans `dc_withdrawals`, un accusé de réception envoyé tout de suite au consommateur et un avis pour vous ; liée depuis le pied de page, la page de paiement, les CGV et la politique de remboursement
- **Adresse et zone** : admin → Mes infos. Cochez « Mon adresse personnelle est la même » et seule l'adresse de facturation est à remplir : sa ville et son pays deviennent l'adresse des mentions légales (`utils/address.js`) ; décochez pour les saisir à part. La **zone affichée sur le site** est calculée depuis l'adresse pendant la saisie : en France par le service public des communes avec le code postal, hors de France par Google (`GOOGLE_MAPS_API_KEY` ; sans clé, le pays) (« Thourotte, France » donne « Hauts-de-France, France », geo.api.gouv.fr ; hors de France, le pays), modifiable. L'accueil, le pied de page et les données lues par Google n'affichent que la zone ; l'adresse exacte reste dans les mentions légales, la politique de confidentialité, le formulaire de rétractation et les documents
- **Médiateur de la consommation** : admin → Mes infos (nom, adresse, site), affiché dans les CGV ; l'admin affiche un rappel tant qu'il est vide
- **Numéros des listes** : `padIndex(i, 'PR')` de `utils/display.js` (`PR-01`, `02`...)
- **Paiement** : le client paie exactement le montant demandé, aucun frais de carte n'est ajouté (interdit pour les cartes de particuliers, art. L.112-12 du Code monétaire et financier) `will-change` seulement sur ce qui bouge (transform, opacity).
- **Photo « Qui suis-je ? »** : se change dans admin → Mes infos (enregistrée tout de suite, stockée comme les images des projets dans `dc_uploads`) ; vide : `public/images/about-me.jpg`
- **Pas de coins arrondis** nulle part (les interrupteurs du bandeau cookies, le point de disponibilité et le chargement restent ronds).
- **Textes** : ceux par défaut sont dans `plugins/translations/` ; les textes visiteurs, et ceux imprimés sur les devis, factures et contrats (`billingDocument.js`, `contracts.js`), se modifient dans admin → Textes du site (`stores/siteTexts.js`, table `dc_texts`), une partie du site à la fois. Un texte français enregistré là remplit l'anglais jamais modifié à la main (traduction automatique, à relire).
- **Compétences** : celles de `data/skills.js`, puis celles ajoutées depuis admin → Compétences (table `dc_skills`, `composables/useSkills.js`), à la fin de leur catégorie. Elles sont aussi proposées pour les projets, qui acceptent n'importe quelle compétence (tapée puis Entrée)
- **Effets de survol** : seulement avec une souris et un écran de plus de 1024 px. Écris chaque règle `:hover` dans
  `@media (hover: hover) and (min-width: 1025px) { ... }` : rien à annuler pour les téléphones et tablettes

## 04 — Cadre des pages (AppShell)

`components/layout/AppShell/AppShell.vue` entoure chaque page, page d'erreur comprise :
loader, en-tête, page, pied de page, boutons flottants (retour en haut, langues) et bandeau cookies.

- **En-tête** : `components/layout/Header/`
- **Pied de page** (réseaux sociaux, liens légaux, gestion des cookies, connexion) : `components/layout/Footer/`

## 05 — Ajouter une page

1. `components/views/About/About.vue` : le contenu (une section = un composant dans le même dossier)
2. `pages/about.vue` : affiche seulement `<About />` et appelle `useSeo('about')`. Le nom du fichier est l'adresse (`/about/`)
3. ses textes dans `plugins/translations/pages/about.js`, importé dans `translations.js`
4. son entrée SEO dans `utils/seo.js`, puis `seoAboutTitle` / `seoAboutDescription` dans `plugins/translations/common/seo.js`
5. son adresse dans `publicRoutes` de `nuxt.config.ts` (sitemap)

## 06 — SEO

- Titre, description et image de partage de chaque page : `utils/seo.js` + `plugins/translations/common/seo.js`
- `sitemap.xml` et `robots.txt` sont créés à partir de `publicRoutes` et `privateRoutes` de `nuxt.config.ts`
- Les adresses finissent toujours par un slash (`withTrailingSlash()` dans `utils/pathHelpers.js`, `middleware/redirect.global.js`)

## 07 — E-mails

Tous les e-mails suivent le site (`server/templates/MailLayout.js`) : son encre, des liens menthe, le logo du site en ligne. Gmail et Outlook ne chargent jamais les polices d'un site : les **titres** sont des images dessinées en Archivo (`public/images/mail/`, liste et images dans `server/templates/MailTitles.js`), mises dans l'e-mail lui-même (`cid:`, `MailHelper`) : elles s'affichent même avant la mise en ligne. Les textes utilisent une police condensée présente partout. Après avoir changé ou ajouté un titre, redessine-les :

```bash
npx -y -p playwright-core node scripts/mail-titles.mjs
```

`public/fonts/` contient les polices TrueType du PDF, des pages de retour Stripe et des images de titres (un fichier par graisse, sans doublon).

---

<p align="center"><sub><a href="03-architecture.md">← 03 — Architecture</a> &nbsp;·&nbsp; <a href="README.md">Documentation</a> &nbsp;·&nbsp; <a href="05-l-api.md">05 — L'API →</a></sub></p>
