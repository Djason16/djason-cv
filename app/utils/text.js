/*
 * Texts of the pages turned into HTML with links: {{email}} / {{phone}} values, [label](url) Markdown links,
 * then plain emails, phone numbers and URLs. "t" is lang.getTranslation (labels of the links).
 *
 *   <span v-html="linkify(t('legalSection1Content', data), data, t)" />
 */

// Removes hidden chars and fix escaped symbols
const cleanInvisible = txt =>
    txt?.replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
        .replace(/&#8203;/g, '')
        .replace(/&#64;/g, '@')
        .replace(/&ZeroWidthSpace;/g, '') || txt

// Text of a link without its final punctuation
const escapeLabel = txt => txt.replace(/[.,!?;:]$/, '')

// Replaces {{email}} / {{phone}} / {{url}} placeholders with links
const injectVars = (txt, vars, t) =>
    txt?.replace(/{{(.*?)}}/g, (_, key) => {
        const val = vars[key.trim()]
        if (!val) return _
        if (key.trim() === 'email') {
            const email = cleanInvisible(val)
            const label = escapeLabel(t('sendEmail', { email }))
            return `<a href="mailto:${email}" title="${label}" aria-label="${label}" class="text-bold">${email}</a>`
        }
        if (key.trim() === 'phone') {
            const phone = cleanInvisible(val)
            const tel = phone.replace(/[^\d+]/g, '')
            const label = escapeLabel(t('callPhone', { phone }))
            return `<a href="tel:${tel}" title="${label}" aria-label="${label}" class="text-bold">${phone}</a>`
        }
        return val
    }) || txt

// Parses [label](url) Markdown links — runs after {{vars}} are injected
const parseMarkdownLinks = txt => {
    if (!txt) return txt
    return txt.replace(
        /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\)]+)\)/g,
        (_, label, href) => {
            const title = escapeLabel(label)
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${title}" aria-label="${title}" class="text-bold">${label}</a>`
        }
    )
}

// Makes plain text clickable (emails, phones, URLs)
const autoLinks = (txt, t) => {
    if (!txt || txt.includes('<a ') || txt.includes('href=') || (txt.includes('{{') && txt.includes('}}'))) return txt
    let out = cleanInvisible(txt)

    // Emails
    out = out.replace(
        /(\s|^)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=[\s.,!?;:]|$)/g,
        (m, before, email) => {
            const label = escapeLabel(t('sendEmail', { email }))
            return `${before}<a href="mailto:${email}" title="${label}" aria-label="${label}" class="text-bold">${email}</a>`
        }
    )

    // Phones (ignore SIRET/SIREN and 14-digit numbers)
    out = out.replace(
        /(\s|^)(\+?[\d\s\-().]{8,})([.,!?;:]?)(?=\s|$)/g,
        (m, before, num, punct) => {
            const digits = num.replace(/[^\d]/g, '')
            if (/SIRET|SIREN/i.test(txt.slice(txt.indexOf(num) - 10, txt.indexOf(num)))) return m
            if (digits.length === 14) return m
            const label = escapeLabel(t('callPhone', { phone: num.trim() }))
            return `${before}<a href="tel:${digits}" title="${label}" aria-label="${label}" class="text-bold">${num.trim()}</a>${punct || ''}`
        }
    )

    // URLs (trim trailing punctuation)
    out = out.replace(
        /\b((https?:\/\/|www\.)[^\s<]+?)([.,!?;:]?)(?=\s|$)/gi,
        (m, url, _, punct) => {
            const href = url.startsWith('http') ? url : `https://${url}`
            const label = escapeLabel(t('visitUrl', { url }))
            return `<a href="${href}" target="_blank" rel="noopener noreferrer" title="${label}" aria-label="${label}" class="text-bold">${url}</a>${punct || ''}`
        }
    )

    return out
}

// Applies variables, then Markdown links, then plain links
export const linkify = (txt, vars = {}, t = key => key) => autoLinks(parseMarkdownLinks(injectVars(txt, vars, t)), t)
