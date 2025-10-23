import { useNuxtApp } from '#app'

export const useContractCalculator = () => {
    const { $lang } = useNuxtApp()

    // Validate contract number is numeric only
    const isValidContractNumber = num => /^\d+$/.test(num?.trim())

    // Prompt with validation loop until valid input or cancellation
    const promptWithValidation = (msgKey, validator, errorKey) => {
        while (true) {
            const input = prompt($lang.getTranslation(msgKey))
            if (input === null) return null
            if (!input.trim()) return ''
            if (validator(input)) return input.trim()
            alert($lang.getTranslation(errorKey))
        }
    }

    // Collect contract number and date with validation
    const promptContractInfo = async group => {
        const contractNumber = promptWithValidation('enterContractNumber', isValidContractNumber, 'invalidContractNumber')
        if (contractNumber === null) return null
        if (!contractNumber) {
            alert($lang.getTranslation('contractNumberRequired'))
            return null
        }

        const contractDate = prompt($lang.getTranslation('enterContractDate')) || ''
        if (contractDate === null) return null

        return { contractNumber, contractDate }
    }

    // Split payment into 12 equal monthly installments
    const calculateMonthlyPayments = total => ({
        totalAmount: total,
        depositAmount: 0,
        nbMensualites: 12,
        monthlyPayment: total / 12
    })

    // Calculate upfront deposit with remaining balance
    const calculateDepositPayment = (total, rate = 0.5) => ({
        totalAmount: total,
        depositAmount: total * rate,
        nbMensualites: 0,
        monthlyPayment: 0
    })

    // Determine payment structure based on service type
    const getPaymentConfig = (total, type) => {
        switch (type) {
            case 'web':
                return calculateMonthlyPayments(total)
            case 'video':
                return calculateDepositPayment(total, 0.5)
            case 'repair':
                return { totalAmount: total, depositAmount: 0, nbMensualites: 0, monthlyPayment: 0 }
            default:
                return calculateMonthlyPayments(total)
        }
    }

    return { getPaymentConfig, promptContractInfo }
}