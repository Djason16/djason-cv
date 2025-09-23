export const useTextEscape = () => {
    // Remove invisible characters and restore escaped @
    const cleanInvisibleChars = text =>
        text?.replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
            .replace(/&#8203;/g, '')
            .replace(/&#64;/g, '@')
            .replace(/&ZeroWidthSpace;/g, '') || text;

    // Convert {{email}} and {{phone}} variables into clickable links
    const createAutoLinks = (text, vars) =>
        text?.replace(/{{(.*?)}}/g, (_, key) => {
            const cleanKey = key.trim();
            const value = vars[cleanKey];
            if (!value) return _;

            if (cleanKey === 'email') {
                const email = cleanInvisibleChars(value);
                return `<a href="mailto:${email}">${email}</a>`;
            }
            if (cleanKey === 'phone') {
                const phone = cleanInvisibleChars(value);
                const href = phone.replace(/[^\d+]/g, '');
                return `<a href="tel:${href}">${phone}</a>`;
            }
            return value;
        }) || text;

    // Detect emails and phone numbers in plain text and make them clickable
    const makeLinksClickable = text => {
        if (!text) return text;
        if (text.includes('<a ') || text.includes('href=') || (text.includes('{{') && text.includes('}}'))) return text;

        let result = cleanInvisibleChars(text);

        // Email links
        result = result.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');

        // Phone links
        result = result.replace(/(\+?[\d\s\-\.()]{8,})/g, m => {
            const href = m.replace(/[^\d+]/g, '');
            return href.length >= 8 ? `<a href="tel:${href}">${m.trim()}</a>` : m;
        });

        return result;
    };

    // Main processing: convert variables first, then plain text links
    const processText = (text, vars = {}) => makeLinksClickable(createAutoLinks(text, vars));

    return { processText, cleanInvisibleChars, createAutoLinks, makeLinksClickable };
};