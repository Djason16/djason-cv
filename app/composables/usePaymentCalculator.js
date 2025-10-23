import { useNuxtApp } from '#app'

export const usePaymentCalculator = () => {
    const { $lang } = useNuxtApp()
    const isIndividualType = t => t === 'individual'

    // Validate DD/MM/YYYY date string
    const isValidDate = s => {
        if (!s) return false
        const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
        if (!match) return false
        const [, d, m, y] = match.map(Number)
        const date = new Date(y, m - 1, d)
        return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    }

    // Validate invoice number (numeric only)
    const isValidInvoiceNumber = num => /^\d+$/.test(num?.trim())

    // Prompt user repeatedly until valid input or cancel
    const promptWithValidation = (msg, validator, errorMsg) => {
        while (true) {
            const input = prompt(msg)
            if (input === null) return null
            if (!input.trim()) return ''
            if (validator(input)) return input.trim()
            alert(errorMsg)
        }
    }

    // Compute totals from missions
    const calculateTotals = missions => {
        const totalHT = missions.reduce((sum, m) => sum + (m.unit_price || 0) * (m.quantity || 1), 0)
        const totalTVA = missions.reduce((sum, m) => sum + ((m.vat_applicable ? 0.2 : 0) * (m.unit_price || 0) * (m.quantity || 1)), 0)
        return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
    }

    // Compute monthly payments given first payment date
    const calculateMonthlyPayments = (total, firstDateStr, totalInstallments = 12) => {
        if (!firstDateStr) return { monthlyPayment: total / totalInstallments, amountPaid: 0, remainingToPay: total, nbMensualites: totalInstallments, paymentDueDate: '', depositAmount: 0 }
        const [d, m, y] = firstDateStr.split('/'), first = new Date(`${y}-${m}-${d}`), today = new Date()
        let monthsElapsed = (today.getFullYear() - first.getFullYear()) * 12 + (today.getMonth() - first.getMonth())
        if (today.getDate() < first.getDate()) monthsElapsed--
        monthsElapsed = Math.max(0, monthsElapsed + 1)
        const monthly = total / totalInstallments
        const amountPaid = monthly * Math.min(monthsElapsed, totalInstallments)
        const remaining = Math.max(0, total - amountPaid)
        return { monthlyPayment: monthly, amountPaid, remainingToPay: monthsElapsed >= totalInstallments ? 0 : remaining, nbMensualites: Math.max(0, totalInstallments - monthsElapsed), paymentDueDate: firstDateStr, depositAmount: 0 }
    }

    // Compute deposit payment upfront
    const calculateDepositPayment = (total, depositPercent = 0.3, dueDate = '') => {
        const deposit = total * depositPercent
        return { depositAmount: deposit, amountPaid: deposit, remainingToPay: total - deposit, nbMensualites: 0, monthlyPayment: 0, paymentDueDate: dueDate }
    }

    // Prompt individual payment based on service type
    const promptIndividualPayment = async (service, total) => {
        const s = service.toLowerCase()
        const datePrompt = () => promptWithValidation($lang.getTranslation('enterPaymentDueDate'), isValidDate, $lang.getTranslation('invalidDateFormat'))
        if (s.includes('web') || s.includes('site')) {
            const monthly = confirm(`${$lang.getTranslation('webPaymentConfirmTitle')}\n\n${$lang.getTranslation('webPaymentConfirmMonthly')}\n${$lang.getTranslation('webPaymentConfirmCash')}`)
            if (monthly) {
                const firstDate = promptWithValidation($lang.getTranslation('enterFirstPaymentDate'), isValidDate, $lang.getTranslation('invalidDateFormat'))
                return firstDate === null ? null : calculateMonthlyPayments(total, firstDate || '', 12)
            } else {
                const due = datePrompt(); if (due === null) return null
                return calculateDepositPayment(total, 0.3, due || '')
            }
        }
        if (s.includes('video') || s.includes('montage')) {
            const due = datePrompt(); if (due === null) return null
            return calculateDepositPayment(total, 0.5, due || '')
        }
        const due = datePrompt(); if (due === null) return null
        if (s.includes('repair') || s.includes('réparation') || s.includes('informatique')) return { depositAmount: 0, amountPaid: 0, remainingToPay: total, nbMensualites: 0, monthlyPayment: 0, paymentDueDate: due || '' }
        return { depositAmount: 0, amountPaid: 0, remainingToPay: total, nbMensualites: 0, monthlyPayment: 0, paymentDueDate: due || '' }
    }

    // Prompt invoice info and optional delivery address
    const promptDocumentInfo = async group => {
        const invoiceNumber = promptWithValidation($lang.getTranslation('enterInvoiceNumber'), isValidInvoiceNumber, $lang.getTranslation('invalidInvoiceNumber'))
        if (invoiceNumber === null) return null
        if (!invoiceNumber) { alert($lang.getTranslation('invoiceNumberRequired')); return null }

        let sameAsClient = true, deliveryAddress = ''
        if (['company', 'freelance'].includes(group.clientType)) {
            sameAsClient = confirm($lang.getTranslation('sameDeliveryAddressConfirm'))
            if (!sameAsClient) {
                deliveryAddress = prompt($lang.getTranslation('enterDeliveryAddress')) || ''
                if (deliveryAddress === null) return null
            }
        }
        const objectDescription = !isIndividualType(group.clientType) ? prompt($lang.getTranslation('enterObjectOptional')) || '' : ''
        if (objectDescription === null) return null
        const orderReference = prompt($lang.getTranslation('enterOrderRefOptional')) || ''
        if (orderReference === null) return null

        return { invoiceNumber, objectDescription, orderReference, deliveryAddress, sameAsClient }
    }

    // Company payment: only due date
    const getCompanyPaymentData = () => {
        const due = promptWithValidation($lang.getTranslation('enterPaymentDueDate'), isValidDate, $lang.getTranslation('invalidDateFormat'))
        if (due === null) return null
        return { depositAmount: 0, amountPaid: 0, remainingToPay: 0, nbMensualites: 0, monthlyPayment: 0, paymentDueDate: due || '' }
    }

    return { calculateTotals, calculateMonthlyPayments, calculateDepositPayment, promptIndividualPayment, promptDocumentInfo, getCompanyPaymentData }
}