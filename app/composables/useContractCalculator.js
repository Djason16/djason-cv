import { useNuxtApp } from '#app'
import { usePaymentConfig } from './usePaymentConfig'

// Utilities to normalize service types and compute contract payments
export const useContractCalculator = () => {
    const { $lang } = useNuxtApp()
    const { normalizeServiceType, getServicePaymentConfig, getServicePaymentConfigByChoice, getServicePaymentRules } = usePaymentConfig()

    // Compute payment config using default or user choice
    const getPaymentConfig = (total, serviceType, paymentChoice = null) => {
        const type = normalizeServiceType(serviceType)
        return paymentChoice ? getServicePaymentConfigByChoice(total, type, paymentChoice) : getServicePaymentConfig(total, type)
    }

    // Get all available payment options with formatted labels and details
    const getPaymentOptions = (total, serviceType) => {
        const rules = getServicePaymentRules(serviceType)
        const formatPrice = v => $lang.locale.value === 'fr'
            ? `${(v ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
            : `${(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

        const options = []

        if (rules.monthlyInstallments > 0) {
            const monthly = total / rules.monthlyInstallments
            options.push({
                value: 'monthly',
                label: $lang.getTranslation('monthlyPaymentOption'),
                details: [
                    `${$lang.getTranslation('numberOfInstallments')}: ${rules.monthlyInstallments}`,
                    `${$lang.getTranslation('monthlyPayment')}: ${formatPrice(monthly)}`
                ]
            })
        }

        if (rules.depositRate > 0) {
            const deposit = total * rules.depositRate
            options.push({
                value: 'deposit',
                label: $lang.getTranslation('upfrontPaymentOption'),
                details: [
                    `${$lang.getTranslation('deposit')}: ${formatPrice(deposit)} (${Math.round(rules.depositRate * 100)}%)`,
                    `${$lang.getTranslation('remainingBalance')}: ${formatPrice(total - deposit)}`
                ]
            })
        }

        if (rules.defaultPaymentType === 'full') {
            options.push({
                value: 'full',
                label: $lang.getTranslation('fullPaymentAfterIntervention'),
                details: [`${$lang.getTranslation('totalAmount')}: ${formatPrice(total)}`]
            })
        }

        return options
    }

    return { normalizeServiceType, getPaymentConfig, getPaymentOptions }
}