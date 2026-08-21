// Temporary password email — sent to admin after security answer verification
export const renderTempPasswordEmail = ({ userEmail, tempPassword, message = '', adminName = 'Admin', locale = 'fr', config }) => {
    const TEXT = {
        fr: {
            title: 'Mot de passe temporaire',
            instruction: "N'oublie pas de le changer après ta connexion.",
            userLabel: 'Ton compte :',
            tempPasswordLabel: 'Mot de passe temporaire',
            regards: 'À bientôt',
            siteNote: `Envoyé depuis mon site ${config.public.frontendDomain}`
        },
        en: {
            title: 'Temporary password',
            instruction: 'Remember to change it after logging in.',
            userLabel: 'Your account:',
            tempPasswordLabel: 'Temporary password',
            regards: 'Cheers',
            siteNote: `Sent from my site ${config.public.frontendDomain}`
        }
    }

    const t = TEXT[locale] || TEXT.fr

    return renderEmailBody({
        title: t.title,
        subtitle: message || `<strong style="font-size:1rem;display:inline;">${t.userLabel}</strong> ${userEmail}`,
        label: t.tempPasswordLabel,
        value: tempPassword,
        instruction: t.instruction,
        regards: t.regards,
        adminName,
        siteNote: t.siteNote,
        locale
    })
}