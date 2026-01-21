import { useNuxtApp } from '#app'
import { useFinancialCalculations } from './useFinancialCalculations'
import { usePaymentConfig } from './usePaymentConfig'

// Provides utilities for quote calculations: totals, validity dates, and individual payment options
export const useQuoteCalculator = () => {
    const { $lang } = useNuxtApp()
    const { calculateTotals } = useFinancialCalculations()
    const { normalizeServiceType, getServicePaymentRules } = usePaymentConfig()

    // Compute quote validity date given an issue date and optional validity days (default 30)
    const getQuoteValidityDate = (issueDate, validityDays = 30) => {
        const d = new Date(issueDate)
        d.setDate(d.getDate() + validityDays)
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        return `${day}/${month}/${d.getFullYear()}`
    }

    // Determine payment options for individual clients based on service type
    const getIndividualPaymentOptions = (service, total) => {
        const serviceType = normalizeServiceType(service)
        const rules = getServicePaymentRules(serviceType)

        if (rules.hasChoice) {
            return {
                hasMultipleOptions: true,
                option1: {
                    type: 'monthly',
                    description: $lang.getTranslation('monthly12Payments'),
                    nbMensualites: rules.monthlyInstallments,
                    monthlyPayment: total / rules.monthlyInstallments,
                    depositAmount: 0
                },
                option2: {
                    type: 'deposit',
                    description: $lang.getTranslation('deposit30Percent'),
                    depositAmount: total * rules.depositRate,
                    remainingToPay: total * (1 - rules.depositRate),
                    nbMensualites: 0
                }
            }
        }

        if (rules.defaultPaymentType === 'deposit') {
            return {
                hasMultipleOptions: false,
                option1: {
                    type: 'deposit',
                    description: $lang.getTranslation('deposit50Percent'),
                    depositAmount: total * rules.depositRate,
                    remainingToPay: total * (1 - rules.depositRate),
                    nbMensualites: 0
                }
            }
        }

        return {
            hasMultipleOptions: false,
            option1: {
                type: 'full',
                description: $lang.getTranslation('fullPayment'),
                depositAmount: 0,
                remainingToPay: total,
                nbMensualites: 0
            }
        }
    }

    return { calculateTotals, getQuoteValidityDate, getIndividualPaymentOptions }
}