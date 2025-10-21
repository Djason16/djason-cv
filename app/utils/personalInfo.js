// Personal information and social links configuration
export const personalInfo = {
    name: "Djason CHERY",                  // Full name
    email: "contact@djason-chery.dev",       // Contact email
    phone: "+33758204726",                 // Contact phone
    birthDate: new Date("1998-07-16"),     // Birth date
    siret: "93970399700014",              // SIRET number (14 digits)
    tvaNumber: "",                              // VAT number
    address: "Thourotte, France",              // City only for public display (RGPD protection)
    invoiceAddress: "16 Rue Jean Jaurès, 60150 Thourotte, France", // Full invoice address

    // Bank details
    bank: {
        iban: "FR76 2823 3000 0115 6546 6214 086",
        bic: "REVOFRP2"
    },

    // Availability settings
    manualOverride: false,              // Set to true to force unavailable (vacations, etc.)
    manualStatus: "unavailable",        // Status when manual override is true

    // Weekly schedule
    workingHours: {
        timezone: "Europe/Paris",
        schedule: {
            1: { start: "09:00", end: "18:00" }, // Monday
            2: { start: "09:00", end: "18:00" }, // Tuesday
            3: { start: "09:00", end: "18:00" }, // Wednesday
            4: { start: "09:00", end: "18:00" }, // Thursday
            5: { start: "09:00", end: "18:00" }, // Friday
        }
    },

    links: {                               // Professional and social profiles
        linkedin: "https://www.linkedin.com/in/djason-chery-3b87702b4", // LinkedIn profile
        github: "https://github.com/Djason16",                            // GitHub repos
        malt: "https://www.malt.fr/profile/djasonchery",                // Freelance profile
        instagram: "https://www.instagram.com/djasonchery",              // Instagram updates
        whatsapp: "https://wa.me/33758204726"                             // WhatsApp direct link
    },
};