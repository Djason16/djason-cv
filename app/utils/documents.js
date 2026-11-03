/*
 * Shared values of the quotes, invoices and contracts (admin editor and templates of components/views/Documents).
 * "language" is lang.current.value ('fr' or 'en').
 */

export const VAT_RATE = 0.2

// Price as printed on the documents: "1 234,00 €" in French, "$1,234.00" in English
export const formatPrice = (value, language) => language === 'fr'
    ? `${(value ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : `$${(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Provider (the site owner) printed on every document: admin > Settings (site = useSite()) and the bank details
export const documentProvider = (site, bank = {}) => ({
    name: site.name,
    email: site.email,
    phone: site.phone,
    tvaNumber: site.tva,
    siret: site.siret,
    address: site.address,
    invoiceAddress: site.invoiceAddress,
    bank: { iban: bank.iban || null, bic: bank.bic || null },
})
