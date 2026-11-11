// Font Awesome reduced to the icons of the site: writes assets/css/font-awesome.css (only the icons and the tools of
// Font Awesome used in the code) and assets/fonts/font-awesome/ (fonts with only these icons). The full Font Awesome is
// about 75 KB of CSS read before the page shows, and up to 150 KB per font; reduced, a few KB.
// Run by npm before dev, build and generate; by hand: node scripts/icons.mjs
// A new icon in the code (class "fa-...") is found at the next run. An icon whose name is built in the code
// ("fa-" + name) is not seen: write its full class somewhere in the code (a list of classes, like socialNetworks.ts).
//   --all-brands  every brand icon kept, with the full brands font (icons chosen by the API: social networks typed on
//                 the admin page); the font is downloaded only when a brand icon is shown
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import subsetFont from 'subset-font'

const root = fileURLToPath(new URL('..', import.meta.url))
const fa = join(root, 'node_modules', '@fortawesome', 'fontawesome-free')
const FOLDERS = ['app.vue', 'error.vue', 'components', 'composables', 'layouts', 'pages', 'plugins', 'stores', 'utils', 'assets', 'server/templates']
const SKIP = /node_modules|[\/]\.(nuxt|output)[\/]|font-awesome\.css$/

// 1. Classes "fa-..." written in the code
const used = new Set()
const walk = (path) => {
    if (SKIP.test(path)) return
    let stat
    try { stat = statSync(path) } catch { return }
    if (stat.isDirectory()) return readdirSync(path).forEach((name) => walk(join(path, name)))
    if (!/\.(vue|ts|js|mjs|css|json|html)$/.test(path)) return
    for (const [, name] of readFileSync(path, 'utf8').matchAll(/\bfa-([a-z0-9]+(?:-[a-z0-9]+)*)/g)) used.add(name)
}
FOLDERS.forEach((folder) => walk(join(root, folder)))

// 2. CSS of Font Awesome, rule by rule (blocks @media / @supports filtered inside)
const css = readFileSync(join(fa, 'css', 'all.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const blocks = (text) => {
    const out = []
    let depth = 0, start = 0
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') depth++
        else if (text[i] === '}' && --depth === 0) { out.push(text.slice(start, i + 1).trim()); start = i + 1 }
    }
    return out.filter(Boolean)
}
// Style classes (fa-solid, fa-brands...) always kept; any other "fa-x" class kept only when used
const STYLE = new Set(['solid', 'regular', 'brands', 'classic'])
const ANIMATIONS = ['beat', 'bounce', 'fade', 'beat-fade', 'flip', 'shake', 'spin', 'spin-pulse', 'pulse', 'spin-reverse']
const ALL_BRANDS = process.argv.includes('--all-brands')
let inBrands = false
const keepSelector = (selector) => {
    if (inBrands && ALL_BRANDS && /^\.fa-[a-z0-9-]+$/.test(selector)) return true
    const names = [...selector.matchAll(/\.fa-([a-z0-9]+(?:-[a-z0-9]+)*)/g)].map((m) => m[1])
    return names.every((name) => STYLE.has(name) || used.has(name))
}
const codepoints = { solid: new Set(), regular: new Set(), brands: new Set() }
// The style written next to an icon is not known here: its glyph goes in the three fonts (a font without it skips it)
const iconStyles = () => ['solid', 'regular', 'brands']
const filter = (text) => blocks(text).map((block) => {
    const head = block.slice(0, block.indexOf('{')).trim()
    const body = block.slice(block.indexOf('{') + 1, -1)
    if (head.startsWith('@keyframes')) return ANIMATIONS.some((a) => used.has(a)) ? block : ''
    if (head.startsWith('@font-face')) { inBrands = body.includes('fa-brands-400'); return block }
    if (head.startsWith('@')) { const inner = filter(body); return inner.trim() ? `${head} {\n${inner}\n}` : '' }
    const selectors = head.split(',').map((s) => s.trim()).filter(keepSelector)
    if (!selectors.length) return ''
    const icon = body.match(/--fa:\s*"\\([0-9a-f]+)"/)
    if (icon) for (const style of inBrands ? ['brands'] : iconStyles()) codepoints[style].add(parseInt(icon[1], 16))
    return `${selectors.join(', ')} {${body}}`
}).filter(Boolean).join('\n')
let out = filter(css)

// 3. Fonts with only the icons used (woff2), next to the CSS (hashed by the build, kept a year by the browser)
const fontsDir = join(root, 'assets', 'fonts', 'font-awesome')
mkdirSync(fontsDir, { recursive: true })
const FONTS = { solid: 'fa-solid-900', regular: 'fa-regular-400', brands: 'fa-brands-400' }
for (const [style, file] of Object.entries(FONTS)) {
    const text = String.fromCodePoint(...codepoints[style], 0x20)
    const full = readFileSync(join(fa, 'webfonts', `${file}.woff2`))
    if (style === 'brands' && ALL_BRANDS) { writeFileSync(join(fontsDir, `${file}.woff2`), full); continue }
    const font = await subsetFont(readFileSync(join(fa, 'webfonts', `${file}.woff2`)), text, { targetFormat: 'woff2' })
    writeFileSync(join(fontsDir, `${file}.woff2`), font)
}
// The other fonts of Font Awesome (v4 / v5 names) are not used
out = out.replace(/@font-face\s*\{[^}]*\}/g, (face) => {
    const file = Object.values(FONTS).find((name) => face.includes(`${name}.woff2`))
    return file && !face.includes('Font Awesome 5') && !face.includes('FontAwesome') ? face.replace(/url\([^)]*\)/, `url("../fonts/font-awesome/${file}.woff2")`) : ''
})
// Written on one line, like a minified file: a generated file is never read, and it stays under the 300 lines of the files
out = out.replace(/\s*\n\s*/g, ' ').replace(/\s*([{};])\s*/g, '$1')
mkdirSync(join(root, 'assets', 'css'), { recursive: true })
writeFileSync(join(root, 'assets', 'css', 'font-awesome.css'), `/* Written by scripts/icons.mjs (npm run before dev, build and generate): do not change by hand.
   Font Awesome Free ${JSON.parse(readFileSync(join(fa, 'package.json'), 'utf8')).version} (https://fontawesome.com, icons CC BY 4.0, fonts SIL OFL 1.1, code MIT), reduced to the icons of the site */
${out}
`)
const count = new Set(Object.values(codepoints).flatMap((set) => [...set])).size
console.log(`font-awesome.css: ${count} icons, ${relative(root, fontsDir)}`)
