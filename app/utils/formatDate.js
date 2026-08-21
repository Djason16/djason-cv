// Format a 'YYYY-MM-DD' date string according to locale
export const formatDate = (dateStr, locale) => {
    const d = new Date(`${dateStr}T00:00:00`)
    if (isNaN(d)) return dateStr
    return d.toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}