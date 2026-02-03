import { useNuxtApp } from '#app'
import { useFinancialCalculations } from './useFinancialCalculations'
import { usePaymentConfig } from './usePaymentConfig'
import { useValidation } from './useValidation'

export const usePaymentCalculator = () => {
    const { $lang } = useNuxtApp()
    const { isValidDate, promptWithValidation } = useValidation()
    const { calculateMonthlyPayments, calculateDepositPayment } = useFinancialCalculations()
    const { normalizeServiceType, getServicePaymentRules } = usePaymentConfig()

    const promptIndividualPayment = async (service, total) => {
        const serviceType = normalizeServiceType(service)
        const rules = getServicePaymentRules(serviceType)

        const datePrompt = () => promptWithValidation(
            'enterPaymentDueDate',
            isValidDate,
            'invalidDateFormat'
        )

        // Web: ask user to choose payment method
        if (rules.hasChoice) {
            const monthly = confirm(
                `${$lang.getTranslation('webPaymentConfirmTitle')}\n\n` +
                `${$lang.getTranslation('webPaymentConfirmMonthly')}\n` +
                `${$lang.getTranslation('webPaymentConfirmCash')}`
            )

            if (monthly) {
                const firstDate = promptWithValidation(
                    'enterFirstPaymentDate',
                    isValidDate,
                    'invalidDateFormat'
                )
                return firstDate === null ? null : calculateMonthlyPayments(total, firstDate || '', 12)
            }

            const due = datePrompt()
            return due === null ? null : calculateDepositPayment(total, rules.depositRate, due || '')
        }

        // Video or repair: apply default rule
        const due = datePrompt()
        if (due === null) return null

        if (rules.depositRate > 0) {
            return calculateDepositPayment(total, rules.depositRate, due || '')
        }

        return {
            depositAmount: 0,
            amountPaid: 0,
            remainingToPay: total,
            nbMensualites: 0,
            monthlyPayment: 0,
            paymentDueDate: due || ''
        }
    }

    const getCompanyPaymentData = () => {
        const due = promptWithValidation(
            'enterPaymentDueDate',
            isValidDate,
            'invalidDateFormat'
        )

        if (due === null) return null

        return {
            depositAmount: 0,
            amountPaid: 0,
            remainingToPay: 0,
            nbMensualites: 0,
            monthlyPayment: 0,
            paymentDueDate: due || ''
        }
    }

    return { promptIndividualPayment, getCompanyPaymentData }
}