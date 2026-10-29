// Client types stored in dc_clients.type (their translation key is the type itself)
const CLIENT_TYPE_INDIVIDUAL = 'individual'
export const CLIENT_TYPE_COMPANY = 'company'
const CLIENT_TYPE_FREELANCE = 'freelance'
const CLIENT_TYPE_ASSOCIATION = 'association'

const CLIENT_TYPES = [CLIENT_TYPE_INDIVIDUAL, CLIENT_TYPE_COMPANY, CLIENT_TYPE_FREELANCE, CLIENT_TYPE_ASSOCIATION]

// Professional / B2B types (company, freelance, association loi 1901): the €40 late payment indemnity applies
const PROFESSIONAL_TYPES = [CLIENT_TYPE_COMPANY, CLIENT_TYPE_FREELANCE, CLIENT_TYPE_ASSOCIATION]

// Only individuals are non-B2B
export const isIndividualType = t => t === CLIENT_TYPE_INDIVIDUAL
// Company client (SIRET and company name on the documents)
export const isCompanyType = t => t === CLIENT_TYPE_COMPANY
export const isProfessionalType = t => PROFESSIONAL_TYPES.includes(t)

// { value, labelKey } options for the select fields
export const getClientTypeOptions = () => CLIENT_TYPES.map(t => ({ value: t, labelKey: t }))
