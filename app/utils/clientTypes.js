// Client types stored in dc_clients.type (their translation key is the type itself)
const CLIENT_TYPES = ['individual', 'company', 'freelance', 'association']

// Only individuals are non-B2B
export const isIndividualType = t => t === 'individual'
// Professional / B2B types (company, freelance, association loi 1901): the €40 late payment indemnity applies
export const isProfessionalType = t => CLIENT_TYPES.includes(t) && !isIndividualType(t)

// { value, labelKey } options for the select fields
export const getClientTypeOptions = () => CLIENT_TYPES.map(t => ({ value: t, labelKey: t }))
