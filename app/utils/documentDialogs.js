import { isProfessionalType } from './clientTypes.js'
import {
    contractPaymentOptions, depositSchedule, fullPaymentSchedule, isValidDate, isValidNumber,
    monthlyPaymentSchedule, normalizeServiceType, paymentRules,
} from './documents.js'

/*
 * Questions asked to the admin in browser dialogs before a quote, invoice or contract is made
 * (composables/useDocuments.js): number, date, delivery address, payment. "t" is lang.getTranslation.
 * Each one returns null when the admin cancels.
 */

// Asks again until the answer is valid; '' = left empty, null = cancelled
const ask = (t, messageKey, isValid, errorKey) => {
    while (true) {
        const input = prompt(t(messageKey))
        if (input === null) return null
        if (!input.trim()) return ''
        if (isValid(input)) return input.trim()
        alert(t(errorKey))
    }
}

export const askNumber = (t, type) => {
    const number = ask(t, `enter${type}Number`, isValidNumber, `invalid${type}Number`)
    if (number === '') alert(t(`${type.toLowerCase()}NumberRequired`))
    return number || null
}

// Contract date (DD/MM/YYYY, today when left empty or invalid) as an ISO string
export const askContractDate = t => {
    const today = new Date()
    const todayText = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    const input = prompt(`${t('enterContractDate')}\n${t('dateFormatHint')}\n${t('leaveEmptyForToday')}`, todayText)
    if (input === null) return null
    if (!input.trim()) return new Date().toISOString()

    // D/M/YYYY or DD/MM/YYYY, and a day that exists in that month
    const [d, m, y] = input.trim().split('/').map(n => parseInt(n, 10))
    const date = new Date(y, m - 1, d)
    const valid = ![d, m, y].some(isNaN) && y >= 1900 && y <= 2100 && date.getDate() === d && date.getMonth() === m - 1
    if (!valid) alert(t('invalidDateFormatContract'))
    return valid ? date.toISOString() : new Date().toISOString()
}

// Delivery address and optional details: asked for professional clients only
export const askDetails = (t, clientType) => {
    let sameAsClient = true, deliveryAddress = ''
    if (isProfessionalType(clientType)) {
        sameAsClient = confirm(t('sameDeliveryAddressConfirm'))
        if (!sameAsClient) deliveryAddress = prompt(t('enterDeliveryAddress')) || ''
    }
    const objectDescription = isProfessionalType(clientType) ? prompt(t('enterObjectOptional')) || '' : ''
    const orderReference = prompt(t('enterOrderRefOptional')) || ''
    return { sameAsClient, deliveryAddress, objectDescription, orderReference }
}

// Payment of an invoice: schedule of the service for individuals, a due date for the others
export const askInvoicePayment = (t, group, total) => {
    const dueDate = key => ask(t, key, isValidDate, 'invalidDateFormat')
    if (group.clientType !== 'individual') {
        const due = dueDate('enterPaymentDueDate')
        // Companies and other professionals: nothing paid, nothing listed as remaining
        return due === null ? null : fullPaymentSchedule(0, due)
    }

    const rules = paymentRules(normalizeServiceType(group.missions[0]?.service_name || ''))
    if (rules.hasChoice && confirm(`${t('webPaymentConfirmTitle')}\n\n${t('webPaymentConfirmMonthly')}\n${t('webPaymentConfirmCash')}`)) {
        const first = dueDate('enterFirstPaymentDate')
        return first === null ? null : monthlyPaymentSchedule(total, first, 12)
    }
    const due = dueDate('enterPaymentDueDate')
    if (due === null) return null
    return rules.depositRate > 0 ? depositSchedule(total, rules.depositRate, due) : fullPaymentSchedule(total, due)
}

// Payment of a contract: one of the options of the service
export const askContractPayment = (t, language, serviceType, total) => {
    const options = contractPaymentOptions(total, serviceType, t, language)
    if (options.length === 1) return options[0].value

    let message = t('contractPaymentChoice')
    options.forEach((opt, i) => {
        message += `${i + 1}. ${opt.label}\n`
        opt.details.forEach(detail => { message += `   ${detail}\n` })
        message += '\n'
    })
    message += t('contractPaymentChoicePrompt')

    while (true) {
        const input = prompt(message)
        if (input === null) return null
        const choice = options[parseInt(input) - 1]
        if (choice) return choice.value
        alert(t('contractPaymentInvalidChoice'))
    }
}
