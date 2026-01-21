import { defineEventHandler, useRuntimeConfig } from '#imports'

export default defineEventHandler(() => {
    const config = useRuntimeConfig()
    return {
        iban: config.bankIban,
        bic: config.bankBic
    }
})
