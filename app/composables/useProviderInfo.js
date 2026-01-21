// Provides reactive provider info with optional bank data
export const useProviderInfo = (bankInfo = {}) => {
    const config = useRuntimeConfig()

    return reactive({
        name: config.public.name,                  // Company name
        email: config.public.contactEmail,        // Contact email
        phone: config.public.contactPhone,        // Contact phone
        tvaNumber: config.public.legalTva,       // VAT number
        siret: config.public.legalSiret,         // SIRET number
        address: config.public.legalAddress,     // Legal address
        invoiceAddress: config.public.legalInvoiceAddress, // Invoice address
        bank: {                                   // Bank details, default null
            iban: bankInfo.iban || null,
            bic: bankInfo.bic || null
        }
    })
}
