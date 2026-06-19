// All client type string values
export const CLIENT_TYPE_INDIVIDUAL = 'individual'
export const CLIENT_TYPE_COMPANY = 'company'
export const CLIENT_TYPE_FREELANCE = 'freelance'
export const CLIENT_TYPE_ASSOCIATION = 'association'

// Full list of client types
export const CLIENT_TYPES = [
    CLIENT_TYPE_INDIVIDUAL,
    CLIENT_TYPE_COMPANY,
    CLIENT_TYPE_FREELANCE,
    CLIENT_TYPE_ASSOCIATION
]

// Only individuals are non-B2B — no €40 late payment indemnity applies
export const INDIVIDUAL_LIKE_TYPES = [CLIENT_TYPE_INDIVIDUAL]

// All professional/B2B types — €40 late payment indemnity applies (freelance, company, association loi 1901, etc.)
export const PROFESSIONAL_TYPES = [CLIENT_TYPE_COMPANY, CLIENT_TYPE_FREELANCE, CLIENT_TYPE_ASSOCIATION]

// Individual type check — only 'individual' is non-B2B
export const isIndividualType = t => t === CLIENT_TYPE_INDIVIDUAL
export const isCompanyType = t => t === CLIENT_TYPE_COMPANY
export const isFreelanceType = t => t === CLIENT_TYPE_FREELANCE
export const isAssociationType = t => t === CLIENT_TYPE_ASSOCIATION

// Returns true only for individual (non-B2B)
export const isIndividualLike = t => t === CLIENT_TYPE_INDIVIDUAL

// Returns true for all B2B types (company, freelance, association)
export const isProfessionalType = t => PROFESSIONAL_TYPES.includes(t)

// Maps each type to its translation key
export const CLIENT_TYPE_LABEL_KEYS = {
    [CLIENT_TYPE_INDIVIDUAL]: 'individual',
    [CLIENT_TYPE_COMPANY]: 'company',
    [CLIENT_TYPE_FREELANCE]: 'freelance',
    [CLIENT_TYPE_ASSOCIATION]: 'association'
}

// Returns { value, labelKey } options for select dropdowns
export const getClientTypeOptions = () =>
    CLIENT_TYPES.map(t => ({ value: t, labelKey: CLIENT_TYPE_LABEL_KEYS[t] }))