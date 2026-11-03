/*
 * Emails of the quotes, invoices and contracts (server/helpers/DocumentMailHelper.js), in the layout of the other emails (MailLayout):
 *   DocumentMails.documents(info)      to the client: the documents attached (a quote, a quote and its contract, a contract, an invoice)
 *   DocumentMails.paid(info)           to the client: the payment received, its invoice attached (admin) or to download (info.download)
 *   DocumentMails.paidOwner(info)      to the owner of the site: a payment online came in
 * info: { types: ['quote', 'contract'...], numbers, title, amount, remaining, link, client, invoice }
 */
const money = amount => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(amount) || 0)
const esc = value => MailHelper.escape(value)
const site = () => String(useRuntimeConfig().public.frontendDomain || '').replace(/\/$/, '')

// The documents sent together: their title and the words of the text
const KINDS = {
    quote: { title: 'Votre devis', label: 'Devis', text: 'votre devis' },
    invoice: { title: 'Votre facture', label: 'Facture', text: 'votre facture' },
    contract: { title: 'Votre contrat', label: 'Contrat', text: 'votre contrat' },
}
const titleOf = types => types.includes('quote') && types.includes('contract') ? 'Votre devis et votre contrat' : KINDS[types[0]]?.title || 'Vos documents'

const signature = settings => ({ regards: 'Bien à vous', adminName: esc(settings.name || ''), locale: 'fr' })

// The documents attached: what to do with them (sign a quote and its contract, pay an invoice)
const documents = (info, settings) => {
    const what = info.types.map(type => KINDS[type]?.text).filter(Boolean).join(' et ')
    const sign = info.types.includes('quote') || info.types.includes('contract')
    const text = sign
        ? `Bonjour, vous trouverez ci-joint ${what}. Pour donner votre accord, renvoyez-${info.types.length > 1 ? 'les' : 'le'} signé${info.types.length > 1 ? 's' : ''} en réponse à cet e-mail. Mes conditions générales de vente sont en ligne : ${site()}/terms/`
        : `Bonjour, vous trouverez ci-joint ${what}${info.remaining > 0 ? `, ${money(info.remaining)} restant à régler` : ', déjà réglée : merci'}.${info.remaining > 0 && info.link ? ' Vous pouvez la payer en ligne, par carte, avec le bouton ci-dessous.' : ''}`
    const html = MailLayout.body({
        title: titleOf(info.types),
        subtitle: info.title ? esc(info.title) : '',
        label: info.types.map(type => KINDS[type]?.label).join(' · '),
        value: esc(info.numbers.join(' · ')),
        instruction: esc(text),
        button: !sign && info.remaining > 0 && info.link ? { href: esc(info.link), label: `Payer ${money(info.remaining)}` } : null,
        siteNote: 'Pour toute question, répondez simplement à cet e-mail.',
        ...signature(settings),
    })
    return { subject: `${titleOf(info.types)} : ${info.numbers.join(' · ')}`, html, text }
}

// A payment received (recorded in the admin, or online): its invoice attached
const paid = (info, settings) => {
    // Attached when sent from the admin; to download (its button) when sent alone by the server
    const where = info.download ? `Votre facture ${info.invoice} est prête : téléchargez-la avec le bouton ci-dessous` : `Vous trouverez ci-joint la facture ${info.invoice}`
    const text = `Bonjour, j'ai bien reçu votre paiement de ${money(info.amount)}, merci. ${where}${info.remaining > 0 ? ` ; il reste ${money(info.remaining)} à régler` : ''}.`
    const html = MailLayout.body({
        title: 'Paiement reçu',
        subtitle: info.title ? esc(info.title) : '',
        label: `Facture ${esc(info.invoice)}`,
        value: esc(money(info.amount)),
        instruction: esc(text),
        button: info.download ? { href: esc(info.download), label: 'Télécharger ma facture' } : null,
        siteNote: 'Pour toute question, répondez simplement à cet e-mail.',
        ...signature(settings),
    })
    return { subject: `Paiement reçu : facture ${info.invoice}`, html, text }
}

const paidOwner = (info, settings) => {
    const text = `${info.client || 'Un client'} a payé ${money(info.amount)} en ligne (${info.number}). Facture ${info.invoice || 'à faire à la main'}. Il a reçu le bouton pour la télécharger.`
    const html = MailLayout.body({
        title: 'Nouveau paiement',
        subtitle: info.title ? esc(info.title) : '',
        label: esc(info.client || ''),
        value: esc(money(info.amount)),
        instruction: esc(text),
        button: { href: esc(`${site()}/admin/`), label: "Ouvrir l'admin" },
        ...signature(settings),
    })
    return { subject: `Nouveau paiement : ${money(info.amount)} (${info.number})`, html, text }
}

export const DocumentMails = { documents, paid, paidOwner }
