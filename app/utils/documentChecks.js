import { isProfessionalType } from '@/utils/clientTypes.js'

/*
 * What is missing before a quote, invoice or contract can be generated (composables/useDocuments.js).
 * Every problem is a translation key (plugins/translations/pages/admin/documentChecks.js):
 *   const problems = documentProblems({ kind: 'contract', group, config, bank, interestRate })
 *   if (problems.length) alert(...)   nothing is generated, the admin fixes the data first
 */
export const documentProblems = ({ kind, group, config, bank, interestRate }) => {
    const problems = []
    const missing = (value, key) => { if (!String(value ?? '').trim()) problems.push(key) }

    // Provider: NUXT_PUBLIC_* values of the .env file
    missing(config.public.name, 'checkProviderName')
    missing(config.public.legalSiret, 'checkProviderSiret')
    missing(config.public.legalInvoiceAddress || config.public.legalAddress, 'checkProviderAddress')

    // Client: admin > clients
    if (!group.client || group.client === 'Unknown') problems.push('checkClientName')
    missing(group.client_address, 'checkClientAddress')
    missing(group.client_postal_code, 'checkClientPostalCode')
    missing(group.client_city, 'checkClientCity')
    if (isProfessionalType(group.clientType)) missing(group.client_siret, 'checkClientSiret')

    // Missions: admin > missions
    if (!group.missions?.length) problems.push('checkNoMission')
    else if (group.missions.some(m => !(m.unit_price > 0))) problems.push('checkMissionPrice')
    if (group.missions?.some(m => !m.date)) problems.push('checkMissionDate')

    // Bank details: BANK_IBAN / BANK_BIC of the .env file
    missing(bank.iban, 'checkBankIban')
    missing(bank.bic, 'checkBankBic')

    // Contract: an interest rate valid today for this type of client (admin > Rates)
    if (kind === 'contract' && interestRate == null) problems.push(isProfessionalType(group.clientType) ? 'checkRateProfessional' : 'checkRateIndividual')

    return problems
}
