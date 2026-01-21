import { defineEventHandler, useRuntimeConfig } from '#imports'

// Return bank info from runtime config
export default defineEventHandler(() => {
    const { bankIban: iban, bankBic: bic } = useRuntimeConfig()
    return { iban, bic }
})