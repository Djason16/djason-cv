/*
 * Reminders sent alone by the server (server/helpers/ReminderHelper.js), in the layout of the other emails (MailLayout):
 *   ReminderMails.invoice(info, settings)     to the client: an invoice to pay (due today, or late: info.late)
 *   ReminderMails.step(info, settings)        to the client: a step of a quote soon (info.soon), due or late
 *   ReminderMails.expiry(info, settings)      to the client: the quote ends in a few days (the button to download it)
 *   ReminderMails.unsigned(info, settings)    to the owner: a quote sent a week ago is not signed yet
 * info: { number, title, amount, date, link, days, client }
 */
const money = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(amount) || 0)
const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const esc = (value: unknown) => MailHelper.escape(value)
const site = () => String(useRuntimeConfig().public.frontendDomain || '').replace(/\/$/, '')

const mail = (settings: Record<string, any>, { subject, title, label, value, text, button, note = 'Pour toute question, répondez simplement à cet e-mail.' }: { subject: string, title: string, label: string, value: string, text: string, button: { href: string, label: string } | null, note?: string }) => ({
    subject,
    text,
    html: MailLayout.body({
        title, label: esc(label), value: esc(value), instruction: esc(text), button,
        regards: 'Bien à vous', adminName: esc(settings.name || ''), siteNote: note, locale: 'fr',
    }),
})
const pay = (info: Record<string, any>, amount: number) => info.link ? { href: esc(info.link), label: `Payer ${money(amount)}` } : null

// An invoice not paid on its date: the day itself, then a week later (late: the penalties of the terms apply)
const invoice = (info: Record<string, any>, settings: Record<string, any>) => mail(settings, {
    subject: info.late ? `Facture en retard : ${info.number}` : `Facture à régler : ${info.number}`,
    title: info.late ? 'Facture en retard' : 'Facture à régler',
    label: `Facture ${info.number}`,
    value: money(info.amount),
    text: info.late
        ? `Bonjour, sauf erreur de ma part, la facture ${info.number} (échéance du ${longDate(info.date)}) n'est pas encore réglée : il reste ${money(info.amount)}. Vous pouvez la payer en ligne, par carte, avec le bouton ci-dessous. Si vous l'avez déjà réglée, merci de ne pas tenir compte de ce message.`
        : `Bonjour, la facture ${info.number} arrive à échéance aujourd'hui : il reste ${money(info.amount)} à régler. Vous pouvez la télécharger et la payer en ligne, par carte, avec le bouton ci-dessous.`,
    button: pay(info, info.amount),
})

// A step of a quote: a few days before its date, on its date, a week after
const step = (info: Record<string, any>, settings: Record<string, any>) => {
    const when = info.soon ? `le ${longDate(info.date)}` : info.late ? `depuis le ${longDate(info.date)}` : "aujourd'hui"
    return mail(settings, {
        subject: info.soon ? `Échéance à venir : ${money(info.amount)} (${info.number})` : `Échéance à régler : ${money(info.amount)} (${info.number})`,
        title: info.soon ? 'Échéance à venir' : 'Échéance à régler',
        label: `${info.step} · devis ${info.number}`,
        value: money(info.amount),
        text: info.soon
            ? `Bonjour, la prochaine échéance de votre devis ${info.number} (${info.step}, ${money(info.amount)}) est à régler ${when}. Vous pouvez la payer dès maintenant en ligne, par carte : votre facture vous sera envoyée aussitôt.`
            : `Bonjour, l'échéance ${info.step} de votre devis ${info.number} (${money(info.amount)}) est à régler ${when}. Vous pouvez la payer en ligne, par carte, avec le bouton ci-dessous : votre facture vous sera envoyée aussitôt.`,
        button: pay(info, info.amount),
    })
}

// The quote ends soon and is not signed: the quote attached again
const expiry = (info: Record<string, any>, settings: Record<string, any>) => mail(settings, {
    subject: `Votre devis expire bientôt : ${info.number}`,
    title: 'Votre devis expire bientôt',
    label: `Devis ${info.number}`,
    value: `Le ${longDate(info.date)}`,
    button: info.link ? { href: esc(info.link), label: 'Télécharger mon devis' } : null,
    text: `Bonjour, le devis ${info.number}${info.title ? ` (${info.title})` : ''} est valable jusqu'au ${longDate(info.date)}. Vous pouvez le télécharger de nouveau avec le bouton ci-dessous : pour donner votre accord, renvoyez-le signé en réponse à cet e-mail. Mes conditions générales de vente : ${site()}/terms/`,
})

// To the owner: a quote sent a week ago, still not signed
const unsigned = (info: Record<string, any>, settings: Record<string, any>) => mail(settings, {
    subject: `Devis en attente : ${info.number} (${info.client})`,
    title: 'Devis en attente',
    label: info.client,
    value: info.number,
    text: `Le devis ${info.number}${info.title ? ` (${info.title})` : ''} a été envoyé à ${info.client} il y a ${info.days} jours et n'est pas encore signé. Une relance de ta part, peut-être ?`,
    button: { href: esc(`${site()}/admin/`), label: "Ouvrir l'admin" },
    note: '',
})

export const ReminderMails = { invoice, step, expiry, unsigned }
