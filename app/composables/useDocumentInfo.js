import { useNuxtApp } from '#app'
import { useValidation } from './useValidation'

// Provides prompts and validation for document numbers, delivery info, and optional fields
export const useDocumentInfo = () => {
    const { $lang } = useNuxtApp()
    const { isValidNumber, promptWithValidation } = useValidation()

    // Prompt for invoice, quote, or contract number with validation
    const promptDocumentNumber = async type => {
        const msgKey = type === 'invoice' ? 'enterInvoiceNumber' :
            type === 'quote' ? 'enterQuoteNumber' : 'enterContractNumber'
        const errorKey = type === 'invoice' ? 'invalidInvoiceNumber' :
            type === 'quote' ? 'invalidQuoteNumber' : 'invalidContractNumber'
        const requiredKey = type === 'invoice' ? 'invoiceNumberRequired' :
            type === 'quote' ? 'quoteNumberRequired' : 'contractNumberRequired'

        const number = promptWithValidation(msgKey, isValidNumber, errorKey)
        if (number === null) return null
        if (!number) { alert($lang.getTranslation(requiredKey)); return null }
        return number
    }

    // Prompt for document date in DD/MM/YYYY format, returns ISO string or null if canceled
    const promptDocumentDate = (type = 'contract') => {
        const today = new Date()
        const defaultDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
        const msgKey = type === 'contract' ? 'enterContractDate' :
            type === 'invoice' ? 'enterInvoiceDate' : 'enterDocumentDate'

        const input = prompt(
            $lang.getTranslation(msgKey) + '\n' +
            ($lang.getTranslation('dateFormatHint')) + '\n' +
            ($lang.getTranslation('leaveEmptyForToday')),
            defaultDate
        )
        if (input === null) return null
        if (!input.trim()) return new Date().toISOString()

        const [d, m, y] = input.trim().split('/').map(n => parseInt(n, 10))
        if ([d, m, y].some(n => isNaN(n)) || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
            alert($lang.getTranslation('invalidDateFormatContract'))
            return new Date().toISOString()
        }

        const parsed = new Date(y, m - 1, d)
        if (parsed.getDate() !== d || parsed.getMonth() !== m - 1 || parsed.getFullYear() !== y) {
            alert($lang.getTranslation('invalidDateFormatContract'))
            return new Date().toISOString()
        }
        return parsed.toISOString()
    }

    // Prompt for delivery address; confirm if same as client or input manually
    const promptDeliveryAddress = async clientType => {
        if (!['company', 'freelance'].includes(clientType)) return { sameAsClient: true, deliveryAddress: '' }

        const sameAsClient = confirm($lang.getTranslation('sameDeliveryAddressConfirm'))
        let deliveryAddress = ''
        if (!sameAsClient) {
            deliveryAddress = prompt($lang.getTranslation('enterDeliveryAddress')) || ''
            if (deliveryAddress === null) return null
        }
        return { sameAsClient, deliveryAddress }
    }

    // Prompt for optional information like object description and order reference
    const promptOptionalInfo = async clientType => {
        const isIndividual = clientType === 'individual'
        const objectDescription = !isIndividual ? prompt($lang.getTranslation('enterObjectOptional')) || '' : ''
        if (objectDescription === null) return null

        const orderReference = prompt($lang.getTranslation('enterOrderRefOptional')) || ''
        if (orderReference === null) return null

        return { objectDescription, orderReference }
    }

    return { promptDocumentNumber, promptDocumentDate, promptDeliveryAddress, promptOptionalInfo }
}