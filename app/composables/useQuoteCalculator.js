import { useNuxtApp } from '#app'

export const useQuoteCalculator = () => {
    const { $lang } = useNuxtApp()
    const isIndividualType = t => t === 'individual'

    // Validate numeric quote number
    const isValidQuoteNumber = num => /^\d+$/.test(num?.trim())

    // Prompt user until valid input or cancel
    const promptWithValidation = (msgKey, validator, errorKey) => {
        while (true) {
            const input = prompt($lang.getTranslation(msgKey))
            if (input === null) return null
            if (!input.trim()) return ''
            if (validator(input)) return input.trim()
            alert($lang.getTranslation(errorKey))
        }
    }

    // Calculate HT, TVA, and TTC totals from missions
    const calculateTotals = missions => {
        const totalHT = missions.reduce((sum, m) => sum + (m.unit_price || 0) * (m.quantity || 1), 0)
        const totalTVA = missions.reduce((sum, m) =>
            sum + ((m.vat_applicable ? 0.2 : 0) * (m.unit_price || 0) * (m.quantity || 1)), 0)
        return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
    }

    // Compute validity date (default 30 days)
    const getQuoteValidityDate = (issueDate, validityDays = 30) => {
        const date = new Date(issueDate)
        date.setDate(date.getDate() + validityDays)
        const day = String(date.getDate()).padStart(2, '0')
        const month = String(date.getMonth() + 1).padStart(2, '0')
        return `${day}/${month}/${date.getFullYear()}`
    }

    // Determine payment options for individual clients
    const getIndividualPaymentOptions = (service, total) => {
        const s = service.toLowerCase()
        if (s.includes('web') || s.includes('site')) return {
            hasMultipleOptions: true,
            option1: { type: 'monthly', description: $lang.getTranslation('monthly12Payments'), nbMensualites: 12, monthlyPayment: total / 12, depositAmount: 0 },
            option2: { type: 'deposit', description: $lang.getTranslation('deposit30Percent'), depositAmount: total * 0.3, remainingToPay: total * 0.7, nbMensualites: 0 }
        }
        if (s.includes('video') || s.includes('montage')) return {
            hasMultipleOptions: false,
            option1: { type: 'deposit', description: $lang.getTranslation('deposit50Percent'), depositAmount: total * 0.5, remainingToPay: total * 0.5, nbMensualites: 0 }
        }
        if (s.includes('repair') || s.includes('réparation') || s.includes('informatique')) return {
            hasMultipleOptions: false,
            option1: { type: 'full', description: $lang.getTranslation('fullPayment'), depositAmount: 0, remainingToPay: total, nbMensualites: 0 }
        }
        return { hasMultipleOptions: false, option1: { type: 'full', description: $lang.getTranslation('fullPayment'), depositAmount: 0, remainingToPay: total, nbMensualites: 0 } }
    }

    // Prompt user for quote info and optional delivery address
    const promptQuoteInfo = async group => {
        const quoteNumber = promptWithValidation('enterQuoteNumber', isValidQuoteNumber, 'invalidQuoteNumber')
        if (quoteNumber === null) return null
        if (!quoteNumber) { alert($lang.getTranslation('quoteNumberRequired')); return null }

        let sameAsClient = true, deliveryAddress = ''
        if (['company', 'freelance'].includes(group.clientType)) {
            sameAsClient = confirm($lang.getTranslation('sameDeliveryAddressConfirm'))
            if (!sameAsClient) deliveryAddress = prompt($lang.getTranslation('enterDeliveryAddress')) || ''
            if (deliveryAddress === null) return null
        }

        const objectDescription = !isIndividualType(group.clientType)
            ? prompt($lang.getTranslation('enterObjectOptional')) || ''
            : ''
        if (objectDescription === null) return null

        const orderReference = prompt($lang.getTranslation('enterOrderRefOptional')) || ''
        if (orderReference === null) return null

        return { quoteNumber, objectDescription, orderReference, deliveryAddress, sameAsClient }
    }

    return { calculateTotals, getQuoteValidityDate, promptQuoteInfo, getIndividualPaymentOptions }
}