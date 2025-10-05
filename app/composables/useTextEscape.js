export const useTextEscape = () => {
    // Remove hidden chars and fix escaped symbols
    const cleanInvisible = txt =>
        txt?.replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
            .replace(/&#8203;/g, '')
            .replace(/&#64;/g, '@')
            .replace(/&ZeroWidthSpace;/g, '') || txt

    // Replace {{email}} / {{phone}} placeholders with links
    const injectVars = (txt, vars) =>
        txt?.replace(/{{(.*?)}}/g, (_, key) => {
            const val = vars[key.trim()]
            if (!val) return _
            if (key.trim() === 'email') {
                const email = cleanInvisible(val)
                return `<a href="mailto:${email}">${email}</a>`
            }
            if (key.trim() === 'phone') {
                const phone = cleanInvisible(val)
                return `<a href="tel:${phone.replace(/[^\d+]/g, '')}">${phone}</a>`
            }
            return val
        }) || txt

    // Make plain text clickable (emails, phones, URLs)
    const autoLinks = txt => {
        if (!txt || txt.includes('<a ') || txt.includes('href=') || (txt.includes('{{') && txt.includes('}}'))) return txt
        let out = cleanInvisible(txt)

        // Emails
        out = out.replace(
            /(\s|^)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=[\s.,!?;:]|$)/g,
            '$1<a href="mailto:$2">$2</a>'
        )

        // Phones (ignore SIRET/SIREN and 14-digit numbers)
        out = out.replace(
            /(\s|^)(\+?[\d\s\-().]{8,})(?=[\s.,!?;:]|$)/g,
            (m, before, num) => {
                const digits = num.replace(/[^\d]/g, '')
                if (/SIRET|SIREN/i.test(txt.slice(txt.indexOf(num) - 10, txt.indexOf(num)))) return m
                if (digits.length === 14) return m
                return `${before}<a href="tel:${digits}">${num.trim()}</a>`
            }
        )

        // URLs (trim trailing punctuation)
        out = out.replace(
            /\b((https?:\/\/|www\.)[^\s<]+?)([.,!?;:]?)(?=\s|$)/gi,
            (m, url, _, punct) => {
                const href = url.startsWith('http') ? url : `https://${url}`
                return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>${punct || ''}`
            }
        )

        return out
    }

    // Apply variables first, then detect links
    const process = (txt, vars = {}) => autoLinks(injectVars(txt, vars))

    return { processText: process, cleanInvisible, createAutoLinks: injectVars, makeLinksClickable: autoLinks }
}