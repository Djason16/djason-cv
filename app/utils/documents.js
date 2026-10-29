/*
 * Business rules of the quotes, invoices and contracts: payment rules per service, totals, schedules,
 * formats and the details of the provider printed on every document. Plain functions, no Vue state:
 * the admin screens use them through composables/useDocuments.js, the templates (components/views/Documents) directly.
 * "t" is lang.getTranslation, "language" is lang.current.value ('fr' or 'en').
 */

export const VAT_RATE = 0.2

// Services and payment rules

// Any service name -> 'web', 'video' or 'repair'
export const normalizeServiceType = rawType => {
    if (!rawType) return 'web'
    const type = rawType.toLowerCase().trim()
    if (['web', 'video', 'repair'].includes(type)) return type
    if (/web|site|development/.test(type)) return 'web'
    if (/video|montage|vfx/.test(type)) return 'video'
    if (/repair|réparation|ordinateur/.test(type)) return 'repair'
    return 'web'
}

// Web: 12 monthly payments or 30 % deposit (client's choice) · Video: 50 % deposit · Repair: paid after the intervention
const PAYMENT_RULES = {
    web: { hasChoice: true, depositRate: 0.3, monthlyInstallments: 12, defaultPaymentType: 'monthly' },
    video: { hasChoice: false, depositRate: 0.5, monthlyInstallments: 0, defaultPaymentType: 'deposit' },
    repair: { hasChoice: false, depositRate: 0, monthlyInstallments: 0, defaultPaymentType: 'full' },
}
// Payment rules of a service (web rules by default)
export const paymentRules = serviceType => PAYMENT_RULES[serviceType] || PAYMENT_RULES.web

// Amounts

// Price as printed on the documents: "1 234,00 €" in French, "$1,234.00" in English
export const formatPrice = (value, language) => language === 'fr'
    ? `${(value ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : `$${(value ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Totals of a group of missions (VAT only on the missions where it applies)
export const missionTotals = missions => {
    // Price of a mission line
    const line = m => (m.unit_price || 0) * (m.quantity || 1)
    const totalHT = missions.reduce((sum, m) => sum + line(m), 0)
    const totalTVA = missions.reduce((sum, m) => sum + (m.vat_applicable ? VAT_RATE : 0) * line(m), 0)
    return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
}

// Invoices: what is already paid and what remains

// 12 monthly payments starting on firstDate (DD/MM/YYYY): months already elapsed count as paid
export const monthlyPaymentSchedule = (total, firstDate, installments = 12) => {
    const monthlyPayment = total / installments
    if (!firstDate) return { monthlyPayment, amountPaid: 0, remainingToPay: total, nbMensualites: installments, paymentDueDate: '', depositAmount: 0 }

    const [d, m, y] = firstDate.split('/')
    const first = new Date(`${y}-${m}-${d}`)
    const today = new Date()
    // Installments already due: whole months since the first one, the first one included
    let monthsElapsed = (today.getFullYear() - first.getFullYear()) * 12 + (today.getMonth() - first.getMonth())
    if (today.getDate() < first.getDate()) monthsElapsed--
    monthsElapsed = Math.max(0, monthsElapsed + 1)

    const amountPaid = monthlyPayment * Math.min(monthsElapsed, installments)
    return {
        monthlyPayment,
        amountPaid,
        remainingToPay: monthsElapsed >= installments ? 0 : Math.max(0, total - amountPaid),
        nbMensualites: Math.max(0, installments - monthsElapsed),
        paymentDueDate: firstDate,
        depositAmount: 0,
    }
}

// Deposit paid, the rest due on dueDate
export const depositSchedule = (total, depositRate, dueDate = '') => {
    const deposit = total * depositRate
    return { depositAmount: deposit, amountPaid: deposit, remainingToPay: total - deposit, nbMensualites: 0, monthlyPayment: 0, paymentDueDate: dueDate }
}

// Nothing paid yet, everything due on dueDate
export const fullPaymentSchedule = (total, dueDate = '') =>
    ({ depositAmount: 0, amountPaid: 0, remainingToPay: total, nbMensualites: 0, monthlyPayment: 0, paymentDueDate: dueDate })

// Quotes

// Validity date (DD/MM/YYYY) of a quote issued on issueDate
export const quoteValidityDate = (issueDate, validityDays = 30) => {
    const d = new Date(issueDate)
    d.setDate(d.getDate() + validityDays)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

// Payment options printed on a quote for a non-company client
export const quotePaymentOptions = (service, total, t) => {
    const rules = paymentRules(normalizeServiceType(service))
    const deposit = description => ({ type: 'deposit', description, depositAmount: total * rules.depositRate, remainingToPay: total * (1 - rules.depositRate), nbMensualites: 0 })

    if (rules.hasChoice) return {
        hasMultipleOptions: true,
        option1: { type: 'monthly', description: t('monthly12Payments'), nbMensualites: rules.monthlyInstallments, monthlyPayment: total / rules.monthlyInstallments, depositAmount: 0 },
        option2: deposit(t('deposit30Percent')),
    }
    if (rules.defaultPaymentType === 'deposit') return { hasMultipleOptions: false, option1: deposit(t('deposit50Percent')) }
    return { hasMultipleOptions: false, option1: { type: 'full', description: t('fullPayment'), depositAmount: 0, remainingToPay: total, nbMensualites: 0 } }
}

// Contracts

// Amounts of a contract for the chosen payment ('monthly', 'deposit' or 'full')
export const contractPayment = (total, serviceType, choice) => {
    const rules = paymentRules(serviceType)
    const base = { totalAmount: total, depositAmount: 0, nbMensualites: 0, monthlyPayment: 0 }
    if (choice === 'monthly' && rules.monthlyInstallments > 0) return { ...base, nbMensualites: rules.monthlyInstallments, monthlyPayment: total / rules.monthlyInstallments }
    if (choice === 'deposit' && rules.depositRate > 0) return { ...base, depositAmount: total * rules.depositRate }
    return base
}

// Payment choices offered for a contract, with the amounts shown to the admin
export const contractPaymentOptions = (total, serviceType, t, language) => {
    const rules = paymentRules(serviceType)
    const price = v => formatPrice(v, language)
    const options = []

    if (rules.monthlyInstallments > 0) options.push({
        value: 'monthly',
        label: t('monthlyPaymentOption'),
        details: [`${t('numberOfInstallments')}: ${rules.monthlyInstallments}`, `${t('monthlyPayment')}: ${price(total / rules.monthlyInstallments)}`],
    })
    if (rules.depositRate > 0) {
        const deposit = total * rules.depositRate
        options.push({
            value: 'deposit',
            label: t('upfrontPaymentOption'),
            details: [`${t('deposit')}: ${price(deposit)} (${Math.round(rules.depositRate * 100)}%)`, `${t('remainingBalance')}: ${price(total - deposit)}`],
        })
    }
    if (rules.defaultPaymentType === 'full') options.push({ value: 'full', label: t('fullPaymentAfterIntervention'), details: [`${t('totalAmount')}: ${price(total)}`] })

    return options
}

// Shared

// Mission lines of a quote or invoice
export const documentItems = (missions, serviceName) => missions.map(m => ({
    name: m.title?.trim() || serviceName(m.service_name) || '-',
    date: m.date,
    hours: m.tjm > 0 ? m.duration : null,
    mission: m.tjm > 0 ? (m.title?.trim() || '') : '',
    quantity: m.quantity || 1,
    unitPrice: m.unit_price,
    tvaApplicable: !!m.vat_applicable,
}))

// Client block of every document
export const documentClient = group => ({
    name: group.client || '',
    address: group.client_address || '',
    postal_code: group.client_postal_code || '',
    city: group.client_city || '',
    siret: group.client_siret || '',
    phone: group.client_phone || '',
    email: group.client_email || '',
    type: group.clientType || 'individual',
})

// Provider (the site owner) printed on every document: NUXT_PUBLIC_* values and the bank details
export const documentProvider = (config, bank = {}) => ({
    name: config.public.name,
    email: config.public.contactEmail,
    phone: config.public.contactPhone,
    tvaNumber: config.public.legalTva,
    siret: config.public.legalSiret,
    address: config.public.legalAddress,
    invoiceAddress: config.public.legalInvoiceAddress,
    bank: { iban: bank.iban || null, bic: bank.bic || null },
})

// DD/MM/YYYY that exists in the calendar
export const isValidDate = s => {
    const match = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (!match) return false
    const [, d, m, y] = match.map(Number)
    const date = new Date(y, m - 1, d)
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}

// Document number: digits only
export const isValidNumber = num => /^\d+$/.test(num?.trim())
