export const usePaymentCalculator = () => {
    const { $lang } = useNuxtApp()

    // Compute totals (HT, TVA, TTC) based on mission data
    const calculateTotals = missions => {
        const totalHT = missions.reduce((s, m) => s + m.unit_price * (m.quantity || 1), 0)
        const totalTVA = missions.reduce((s, m) => {
            const item = m.unit_price * (m.quantity || 1)
            return s + (m.vat_applicable ? item * 0.2 : 0)
        }, 0)
        return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
    }

    // Compute monthly installments based on first payment date
    const calculateMonthlyPayments = (total, firstDateStr, totalInstallments = 12) => {
        if (!firstDateStr)
            return { monthlyPayment: total / totalInstallments, amountPaid: 0, remainingToPay: total, nbMensualites: totalInstallments, paymentDueDate: '', depositAmount: 0 }

        const [d, m, y] = firstDateStr.split('/')
        const firstDate = new Date(`${y}-${m}-${d}`)
        const today = new Date()
        const monthly = total / totalInstallments

        let monthsElapsed = (today.getFullYear() - firstDate.getFullYear()) * 12 + (today.getMonth() - firstDate.getMonth())
        if (today.getDate() < firstDate.getDate()) monthsElapsed -= 1
        monthsElapsed = Math.max(0, monthsElapsed + 1)

        const amountPaid = monthly * Math.min(monthsElapsed, totalInstallments)
        const remaining = Math.max(0, total - amountPaid)
        const remainingMonths = Math.max(0, totalInstallments - monthsElapsed)

        return { monthlyPayment: monthly, amountPaid, remainingToPay: remainingMonths === 0 ? 0 : remaining, nbMensualites: remainingMonths, paymentDueDate: firstDateStr, depositAmount: 0 }
    }

    // Compute 30% upfront payment and remaining balance
    const calculateCashPayment = (total, dueDate = '') => {
        const deposit = total * 0.3
        return { depositAmount: deposit, amountPaid: deposit, remainingToPay: total - deposit, nbMensualites: 0, monthlyPayment: 0, paymentDueDate: dueDate }
    }

    // Ask user for payment details (monthly or cash) for individuals
    const promptIndividualPayment = async (service, total) => {
        const isWeb = service.toLowerCase().includes('web') || service.toLowerCase().includes('site')

        if (isWeb) {
            const monthly = confirm(
                `${$lang.getTranslation('webPaymentConfirmTitle')}\n\n${$lang.getTranslation('webPaymentConfirmMonthly')}\n${$lang.getTranslation('webPaymentConfirmCash')}`
            )
            if (monthly) {
                const first = prompt($lang.getTranslation('enterFirstPaymentDate'))
                return calculateMonthlyPayments(total, first, 12)
            }
        }

        const due = prompt($lang.getTranslation('enterPaymentDueDate')) || ''
        return calculateCashPayment(total, due)
    }

    // Ask user for invoice metadata and optional delivery info
    const promptDocumentInfo = async group => {
        const invoiceNumber = prompt($lang.getTranslation('enterInvoiceNumber'))
        if (!invoiceNumber?.trim()) {
            alert($lang.getTranslation('invoiceNumberRequired'))
            return null
        }

        let sameAsClient = true, deliveryAddress = ''
        if (['company', 'freelance'].includes(group.clientType)) {
            sameAsClient = confirm($lang.getTranslation('sameDeliveryAddressConfirm'))
            if (!sameAsClient) deliveryAddress = prompt($lang.getTranslation('enterDeliveryAddress')) || ''
        }

        const objectDescription = prompt($lang.getTranslation('enterObjectOptional')) || ''
        const orderReference = prompt($lang.getTranslation('enterOrderRefOptional')) || ''

        return { invoiceNumber, objectDescription, orderReference, deliveryAddress, sameAsClient }
    }

    // For companies, only ask for due date (no monthly plan)
    const getCompanyPaymentData = () => {
        const due = prompt($lang.getTranslation('enterPaymentDueDate')) || ''
        return { depositAmount: 0, amountPaid: 0, remainingToPay: 0, nbMensualites: 0, monthlyPayment: 0, paymentDueDate: due }
    }

    return {
        calculateTotals,
        calculateMonthlyPayments,
        calculateCashPayment,
        promptIndividualPayment,
        promptDocumentInfo,
        getCompanyPaymentData
    }
}