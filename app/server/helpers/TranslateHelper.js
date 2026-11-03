/*
 * Machine translation of the texts written in the admin (a help: they are checked and corrected after), as on Battle Arena.
 * MyMemory: free, no key; about 5,000 characters a day, 50,000 with an email in MYMEMORY_EMAIL (.env, section Translation).
 * The {{words}} of a text (values filled in by the site) and the HTML tags are kept as they are.
 *
 *   await TranslateHelper.translate('Bonjour {{name}}', 'fr', ['en'])   { en: 'Hello {{name}}' }
 */
import { LANGUAGES } from '~/plugins/translations/translations.js'

const MAX_LENGTH = 5000
// MyMemory: 500 bytes at most per request
const PART_BYTES = 450
const bytes = text => Buffer.byteLength(text, 'utf8')

// A line in parts of PART_BYTES at most, cut after a sentence when possible
const parts = line => {
    if (bytes(line) <= PART_BYTES) return [line]
    const result = []
    let current = ''
    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
        if (current && bytes(`${current} ${sentence}`) > PART_BYTES) result.push(current), current = ''
        current = current ? `${current} ${sentence}` : sentence
        while (bytes(current) > PART_BYTES) {
            let cut = current.slice(0, PART_BYTES)
            while (bytes(cut) > PART_BYTES) cut = cut.slice(0, -1)
            result.push(cut)
            current = current.slice(cut.length)
        }
    }
    if (current) result.push(current)
    return result
}

// One part in one language
const ask = async (text, from, to) => {
    const query = new URLSearchParams({ q: text, langpair: `${from}|${to}` })
    const email = useRuntimeConfig().mymemoryEmail
    if (email) query.set('de', email)
    const res = await fetch(`https://api.mymemory.translated.net/get?${query}`, { signal: AbortSignal.timeout(15000) })
    if (!res.ok) throw new Error(`translateUnavailable`)
    const answer = await res.json()
    if (answer.quotaFinished || Number(answer.responseStatus ?? 200) !== 200) throw new Error('translateQuota')
    return decode(String(answer.responseData?.translatedText ?? text))
}

// MyMemory sends some characters as HTML entities
const decode = text => text
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

export const TranslateHelper = {
    MAX_LENGTH,

    /** Translations of a text: { en: '...' }; throws 'translateQuota' or 'translateUnavailable'. */
    async translate(text, from, to) {
        const targets = [...new Set(to)].filter(language => language !== from)
        if (!LANGUAGES.includes(from) || targets.some(language => !LANGUAGES.includes(language))) throw new Error('translateLanguage')
        if (text.length > MAX_LENGTH) throw new Error('translateTooLong')

        // {{words}} and <tags> -> [[0]], [[1]]... during the translation
        const kept = []
        const protectedText = text.replace(/\{\{.*?\}\}|<[^>]+>/g, match => `[[${kept.push(match) - 1}]]`)
        const restore = value => value.replace(/\[\[\s*(\d+)\s*\]\]/g, (match, i) => kept[Number(i)] ?? match)

        // Line by line: the start of a line (spaces, list marks) kept as it is; every part of every language asked at once
        const lines = protectedText.split(/\r?\n/).map(line => {
            const start = line.match(/^\s*(?:[-•]\s+|\d+[.)]\s+)?/)[0]
            return { start, parts: line.trim() ? parts(line.slice(start.length)) : [] }
        })
        const entries = await Promise.all(targets.map(async language => {
            const translated = await Promise.all(lines.map(async line =>
                line.start + (await Promise.all(line.parts.map(part => ask(part, from, language)))).join(' ').trim()))
            return [language, restore(translated.join('\n'))]
        }))
        return Object.fromEntries(entries)
    },
}
