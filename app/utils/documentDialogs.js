import { isProfessionalType } from './clientTypes.js'
import { showChoice, showConfirm, showDatePrompt, showFailure, showPrompt } from './dialog.js'
import {
    contractPaymentOptions, depositSchedule, fullPaymentSchedule, isValidDate, isValidNumber,
    monthlyPaymentSchedule, normalizeServiceType, paymentRules,
} from './documents.js'

/*
 * Questions asked to the admin in the dialogs of the site (utils/dialog.js) before a quote, invoice or contract is made
 * (composables/useDocuments.js): number, date, delivery address, payment. "t" is lang.getTranslation.
 * Each one resolves to null when the admin cancels.
 */

// Asks again until the answer is valid; '' = left empty, null = cancelled (prompt = showPrompt, or showDatePrompt for a calendar)
const ask = async (t, messageKey, isValid, errorKey, prompt = showPrompt) => {
    while (true) {
        const input = await prompt(t(messageKey))
        if (input === null) return null
        if (!input.trim()) return ''
        if (isValid(input)) return input.trim()
        showFailure(t(errorKey))
    }
}

// Number of a quote or an invoice, asked until it is valid (null when cancelled)
export const askNumber = async (t, type) => {
    const number = await ask(t, `enter${type}Number`, isValidNumber, `invalid${type}Number`)
    if (number === '') showFailure(t(`${type.toLowerCase()}NumberRequired`))
    return number || null
}

// Contract date picked in a calendar (today when left empty or invalid) as an ISO string
export const askContractDate = async t => {
    const today = new Date()
    const todayText = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    const input = await showDatePrompt(`${t('enterContractDate')}
${t('leaveEmptyForToday')}`, todayText)
    if (input === null) return null
    if (!input.trim()) return new Date().toISOString()

    // D/M/YYYY or DD/MM/YYYY, and a day that exists in that month
    const [d, m, y] = input.trim().split('/').map(n => parseInt(n, 10))
    const date = new Date(y, m - 1, d)
    const valid = ![d, m, y].some(isNaN) && y >= 1900 && y <= 2100 && date.getDate() === d && date.getMonth() === m - 1
    if (!valid) showFailure(t('invalidDateFormatContract'))
    return valid ? date.toISOString() : new Date().toISOString()
}

// Delivery address and optional details: asked for professional clients only
export const askDetails = async (t, clientType) => {
    let sameAsClient = true, deliveryAddress = '', objectDescription = ''
    if (isProfessionalType(clientType)) {
        sameAsClient = await showConfirm(t('sameDeliveryAddressConfirm'), { okLabel: t('yes'), cancelLabel: t('no') })
        if (!sameAsClient) deliveryAddress = (await showPrompt(t('enterDeliveryAddress'))) || ''
        objectDescription = (await showPrompt(t('enterObjectOptional'))) || ''
    }
    const orderReference = (await showPrompt(t('enterOrderRefOptional'))) || ''
    return { sameAsClient, deliveryAddress, objectDescription, orderReference }
}

// Payment of an invoice: schedule of the service for individuals, a due date for the others
export const askInvoicePayment = async (t, group, total) => {
    // Date picked in a calendar, asked again until it is valid
    const dueDate = key => ask(t, key, isValidDate, 'invalidDateFormat', showDatePrompt)
    if (group.clientType !== 'individual') {
        const due = await dueDate('enterPaymentDueDate')
        // Companies and other professionals: nothing paid, nothing listed as remaining
        return due === null ? null : fullPaymentSchedule(0, due)
    }

    const rules = paymentRules(normalizeServiceType(group.missions[0]?.service_name || ''))
    if (rules.hasChoice) {
        const mode = await showChoice(t('webPaymentConfirmTitle'), [
            { value: 'monthly', label: t('webPaymentConfirmMonthly') },
            { value: 'cash', label: t('webPaymentConfirmCash') },
        ])
        if (mode === null) return null
        if (mode === 'monthly') {
            const first = await dueDate('enterFirstPaymentDate')
            return first === null ? null : monthlyPaymentSchedule(total, first, 12)
        }
    }
    const due = await dueDate('enterPaymentDueDate')
    if (due === null) return null
    return rules.depositRate > 0 ? depositSchedule(total, rules.depositRate, due) : fullPaymentSchedule(total, due)
}

// Payment of a contract: one of the options of the service, picked with a button
export const askContractPayment = async (t, language, serviceType, total) => {
    const options = contractPaymentOptions(total, serviceType, t, language)
    if (options.length === 1) return options[0].value
    return showChoice(t('contractPaymentChoice'), options)
}
