import { currentTimeZone } from '~/utils/display'
/*
 * Emails of an online withdrawal (server/controllers/WithdrawalsController.js), in the layout of the other emails (MailLayout):
 *   WithdrawalMails.receipt(withdrawal, settings)   to the consumer: the acknowledgement on a durable medium, without delay
 *   WithdrawalMails.notice(withdrawal, settings)    to the owner of the site: what was sent
 */
// A withdrawal of the form of the site: who, the reference of the order, a message
type Withdrawal = { name: string, email: string, reference: string, message?: string }

const TEXTS = {
    fr: {
        receiptSubject: 'Votre rétractation a bien été reçue',
        receiptTitle: 'Rétractation reçue',
        receiptSubtitle: 'Accusé de réception',
        label: 'Contrat concerné',
        receiptText: (w: Withdrawal, when: string) => `Bonjour ${w.name}, votre demande de rétractation a été reçue le ${when}. Je reviens vers vous rapidement pour le remboursement des sommes dues, au plus tard dans les 14 jours, sur le moyen de paiement utilisé.`,
        noticeSubject: 'Nouvelle rétractation en ligne',
        noticeTitle: 'Rétractation en ligne',
        noticeText: (w: Withdrawal, when: string) => `${w.name} (${w.email}) s'est rétracté le ${when}.${w.message ? ` Message : ${w.message}` : ''} Remboursement à faire dans les 14 jours.`,
        regards: 'Bien à vous',
        siteNote: 'Cet email vaut accusé de réception de votre rétractation : conservez-le.',
    },
    en: {
        receiptSubject: 'Your withdrawal has been received',
        receiptTitle: 'Withdrawal received',
        receiptSubtitle: 'Acknowledgement of receipt',
        label: 'Contract concerned',
        receiptText: (w: Withdrawal, when: string) => `Hello ${w.name}, your withdrawal was received on ${when}. I will get back to you shortly for the refund of the amounts due, within 14 days at the latest, on the payment method used.`,
        noticeSubject: 'New online withdrawal',
        noticeTitle: 'Online withdrawal',
        noticeText: (w: Withdrawal, when: string) => `${w.name} (${w.email}) withdrew on ${when}.${w.message ? ` Message: ${w.message}` : ''} Refund to make within 14 days.`,
        regards: 'Best regards',
        siteNote: 'This email is the acknowledgement of your withdrawal: keep it.',
    },
}

// Values of the consumer, made safe for HTML
const safe = (w: Withdrawal): Withdrawal => ({ name: MailHelper.escape(w.name), email: MailHelper.escape(w.email), reference: MailHelper.escape(w.reference), message: MailHelper.escape(w.message || '') })
const moment = (date: Date, locale: string) => date.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-GB', { dateStyle: 'long', timeStyle: 'short', timeZone: currentTimeZone() })

const build = (kind: string, withdrawal: Record<string, any>, settings: Record<string, any>) => {
    const locale = withdrawal.language === 'en' ? 'en' : 'fr'
    const t = TEXTS[locale as keyof typeof TEXTS]
    const w = safe(withdrawal as Withdrawal)
    const when = moment(withdrawal.createdAt || new Date(), locale)
    const receipt = kind === 'receipt'
    const html = MailLayout.body({
        title: receipt ? t.receiptTitle : t.noticeTitle,
        subtitle: receipt ? t.receiptSubtitle : '',
        label: t.label,
        value: w.reference,
        instruction: receipt ? t.receiptText(w, when) : t.noticeText(w, when),
        regards: t.regards,
        adminName: MailHelper.escape(settings.name || ''),
        siteNote: receipt ? t.siteNote : '',
        locale,
    })
    const subject = receipt ? t.receiptSubject : t.noticeSubject
    const text = `${receipt ? t.receiptText(withdrawal as Withdrawal, when) : t.noticeText(withdrawal as Withdrawal, when)}\n${t.label} : ${withdrawal.reference}`
    return { subject, html, text }
}

export const WithdrawalMails = {
    receipt: (withdrawal: Record<string, any>, settings: Record<string, any>) => build('receipt', withdrawal, settings),
    notice: (withdrawal: Record<string, any>, settings: Record<string, any>) => build('notice', withdrawal, settings),
}
