/* Public-facing personal, business, and availability metadata */
export const personalInfo = {
    name: 'Djason CHERY',
    email: 'contact@djason-chery.dev',
    phone: '+33758204726',
    birthDate: new Date('1998-07-16'),

    /* Legal and billing identifiers */
    siret: '93970399700014',
    tvaNumber: 'FR33939703997',

    /* Address exposure is intentionally limited for privacy */
    address: 'Thourotte, France',
    invoiceAddress: '16 Rue Jean Jaurès, 60150 Thourotte',

    /* Banking details for invoicing */
    bank: {
        iban: 'FR76 2823 3000 0115 6546 6214 086',
        bic: 'REVOFRP2'
    },

    /* Hard unavailability window (e.g. holidays) */
    unavailableRange: {
        start: '2025-12-19',
        end: '2026-01-05'
    },

    /* Manual availability override */
    manualOverride: false,
    manualStatus: 'unavailable',

    /* Weekly working schedule, timezone-aware */
    workingHours: {
        timezone: 'Europe/Paris',
        schedule: {
            1: { start: '09:00', end: '18:00' }, // Mon
            2: { start: '09:00', end: '18:00' }, // Tue
            3: { start: '09:00', end: '18:00' }, // Wed
            4: { start: '09:00', end: '18:00' }, // Thu
            5: { start: '09:00', end: '18:00' }  // Fri
        }
    },

    /* Professional and social links */
    links: {
        linkedin: 'https://www.linkedin.com/in/djason-chery-3b87702b4',
        github: 'https://github.com/Djason16',
        malt: 'https://www.malt.fr/profile/djasonchery',
        instagram: 'https://www.instagram.com/djasonchery',
        whatsapp: 'https://wa.me/33758204726'
    }
}