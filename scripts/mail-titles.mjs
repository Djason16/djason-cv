/*
 * Titles of the emails drawn as images, in the font of the site (Archivo, expanded): Gmail and Outlook never load the fonts
 * of a site, an image keeps them. Writes app/public/images/mail/<name>.png (twice the size, sharp on every screen) and
 * app/server/templates/MailTitles.js (the list read by MailLayout: an email title found there is shown as its image).
 *
 * Run again after a title of an email changed (server/templates); each image goes inside the emails (no need of the site online):
 *   npx -y -p playwright-core node scripts/mail-titles.mjs
 * Chrome is used (CHROME_PATH, or the usual place of Chrome on Windows).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const APP = join(ROOT, 'app')
const OUT = join(APP, 'public', 'images', 'mail')
const { chromium } = createRequire(join(process.cwd(), 'noop.js'))('playwright-core')

// Every title of the emails, French and English (server/templates/MailTemplates.js, WithdrawalMails.js, AutopayMails.js, DocumentMails.js, ReminderMails.js)
const TITLES = [
    'Code de connexion', 'Login code',
    'Mot de passe temporaire', 'Temporary password',
    'Mon planning de la semaine', 'My weekly schedule',
    'Rétractation reçue', 'Withdrawal received',
    'Rétractation en ligne', 'Online withdrawal',
    'Prélèvement à venir', 'Prélèvement refusé', 'Échéance à régler',
    'Votre devis', 'Votre facture', 'Votre contrat', 'Votre devis et votre contrat', 'Vos documents', 'Paiement reçu', 'Nouveau paiement',
    'Facture à régler', 'Facture en retard', 'Échéance à venir', 'Votre devis expire bientôt', 'Devis en attente',
]
// Width of the text of an email (600 px less its padding), size of the titles
const WIDTH = 536
const SIZE = 28

const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
// The font inlined in the page (a blank page may not read a file of the disk)
const font = `data:font/woff2;base64,${readFileSync(join(APP, 'public', 'fonts', 'Archivo-Expanded-SemiBold.ttf')).toString('base64')}`

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' })
const page = await browser.newPage({ viewport: { width: WIDTH, height: 200 }, deviceScaleFactor: 2 })
const list = {}
for (const text of TITLES) {
    await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
        @font-face { font-family: Archivo; src: url(${font}) format('truetype'); font-weight: 600; font-stretch: 125%; }
        html, body { margin: 0; background: transparent; }
        h1 { display: inline-block; max-width: ${WIDTH}px; margin: 0; font-family: Archivo; font-stretch: 125%; font-weight: 600; font-size: ${SIZE}px;
             line-height: 1.08; letter-spacing: 0.01em; text-transform: uppercase; color: #eef1f3; }
    </style></head><body><h1>${text}</h1></body></html>`)
    await page.evaluate(async () => { await document.fonts.load('600 28px Archivo'); await document.fonts.ready })
    if (!(await page.evaluate(() => document.fonts.check('600 28px Archivo')))) throw new Error('Archivo not loaded')
    const box = await page.locator('h1').boundingBox()
    const width = Math.ceil(box.width), height = Math.ceil(box.height)
    const file = `${slug(text)}.png`
    await page.screenshot({ path: join(OUT, file), omitBackground: true, clip: { x: 0, y: 0, width, height } })
    // The image itself too: put in the email (cid), it shows even before the site is online again
    list[text] = { file, width, height, data: readFileSync(join(OUT, file)).toString('base64') }
}
await browser.close()

writeFileSync(join(APP, 'server', 'templates', 'MailTitles.js'), `/*
 * Titles of the emails drawn as images in the font of the site (written by scripts/mail-titles.mjs, do not change by hand):
 * MailLayout shows a title found here as its image, the text as its alternative; MailHelper puts the image in the email (cid:).
 */
export const MailTitles = ${JSON.stringify(list, null, 4)}
`)
console.log(`${TITLES.length} titles drawn in app/public/images/mail/`)
