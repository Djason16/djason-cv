/*
 * Emails of the automatic debit (server/helpers/AutopayHelper.js), in the layout of the other emails (MailLayout):
 *   AutopayMails.failedClient(info)   to the client: the step could not be charged, the link to pay it by hand
 *   AutopayMails.failedOwner(info)    to the owner of the site: what failed and why
 *   AutopayMails.upcoming(info)       to the client, 7 days before: the date, the amount and the card of the next debit
 * info: { number, title, step, amount, link, reason, name, date, card }
 */
const money = (amount: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(amount) || 0)

const build = (info: Record<string, any>, settings: Record<string, any>, owner: boolean) => {
    const n = MailHelper.escape(info.number)
    const text = owner
        ? `Le prélèvement automatique de l'échéance de ${money(info.amount)} du devis ${info.number} n'a pas pu être fait (${info.reason}). Le client a reçu le lien pour la payer à la main : ${info.link}`
        : `Bonjour, le prélèvement automatique de l'échéance de ${money(info.amount)} (devis ${info.number}) n'a pas pu être fait par votre banque. Vous pouvez la régler en ligne, par carte, avec le bouton ci-dessous.`
    const html = MailLayout.body({
        title: owner ? 'Prélèvement refusé' : 'Échéance à régler',
        subtitle: info.title ? MailHelper.escape(info.title) : '',
        label: owner ? 'Devis' : "Montant de l'échéance",
        value: owner ? n : MailHelper.escape(money(info.amount)),
        instruction: MailHelper.escape(text),
        button: { href: MailHelper.escape(info.link), label: owner ? 'Voir le lien de paiement' : `Payer ${money(info.amount)}` },
        regards: 'Bien à vous',
        adminName: MailHelper.escape(settings.name || ''),
        siteNote: owner ? '' : 'Le prélèvement automatique des échéances suivantes reste actif.',
        locale: 'fr',
    })
    return { subject: owner ? `Prélèvement refusé : ${info.number}` : `Échéance à régler : ${info.number}`, html, text }
}

// "le 3 décembre 2026"
const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

// The next debit, announced 7 days before: nothing to do, the link shows every step
const upcoming = (info: Record<string, any>, settings: Record<string, any>) => {
    const text = `Bonjour, le ${longDate(info.date)}, ${money(info.amount)} seront prélevés automatiquement sur votre carte ${info.card || ''} pour l'échéance ${info.step || ''} du devis ${info.number}. Vous n'avez rien à faire. Pour toute question, répondez simplement à cet e-mail.`
    const html = MailLayout.body({
        title: 'Prélèvement à venir',
        subtitle: info.title ? MailHelper.escape(info.title) : '',
        label: `Le ${MailHelper.escape(longDate(info.date))}`,
        value: MailHelper.escape(money(info.amount)),
        instruction: MailHelper.escape(text.replace(/\s+/g, ' ')),
        button: { href: MailHelper.escape(info.link), label: 'Voir mes échéances' },
        regards: 'Bien à vous',
        adminName: MailHelper.escape(settings.name || ''),
        siteNote: 'Vous recevrez un reçu de Stripe après le prélèvement.',
        locale: 'fr',
    })
    return { subject: `Prélèvement le ${longDate(info.date)} : ${money(info.amount)} (${info.number})`, html, text }
}

export const AutopayMails = {
    upcoming,
    failedClient: (info: Record<string, any>, settings: Record<string, any>) => build(info, settings, false),
    failedOwner: (info: Record<string, any>, settings: Record<string, any>) => build(info, settings, true),
}
