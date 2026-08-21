// OTP email — sent to user after successful credential verification
export const renderOtpEmail = ({ code, adminName = 'Admin', locale = 'fr', config }) => {
    const TEXT = {
        fr: {
            title: 'Code de connexion',
            instruction: 'Ce code expire dans 10 minutes. Ne le partagez pas.',
            codeLabel: 'Code OTP',
            regards: 'À bientôt',
            siteNote: `Envoyé depuis mon site ${config.public.frontendDomain}`
        },
        en: {
            title: 'Login code',
            instruction: 'This code expires in 10 minutes. Do not share it.',
            codeLabel: 'OTP Code',
            regards: 'Cheers',
            siteNote: `Sent from my site ${config.public.frontendDomain}`
        }
    }

    const t = TEXT[locale] || TEXT.fr

    return renderEmailBody({
        title: t.title,
        label: t.codeLabel,
        value: code,
        instruction: t.instruction,
        regards: t.regards,
        adminName,
        siteNote: t.siteNote,
        locale
    })
}