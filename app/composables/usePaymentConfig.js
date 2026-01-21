export const usePaymentConfig = () => {
    // Normalize any service string to web, video, or repair
    const normalizeServiceType = rawType => {
        if (!rawType) return 'web'
        const type = rawType.toLowerCase().trim()
        if (['web', 'video', 'repair'].includes(type)) return type
        if (/web|site|development/.test(type)) return 'web'
        if (/video|montage|vfx/.test(type)) return 'video'
        if (/repair|réparation|ordinateur/.test(type)) return 'repair'
        return 'web'
    }

    // Payment rules per service
    const getServicePaymentRules = serviceType => ({
        web: { hasChoice: true, depositRate: 0.3, monthlyInstallments: 12, defaultPaymentType: 'monthly' },
        video: { hasChoice: false, depositRate: 0.5, monthlyInstallments: 0, defaultPaymentType: 'deposit' },
        repair: { hasChoice: false, depositRate: 0, monthlyInstallments: 0, defaultPaymentType: 'full' }
    }[serviceType] || { hasChoice: true, depositRate: 0.3, monthlyInstallments: 12, defaultPaymentType: 'monthly' })

    // Default payment config for contracts
    const getServicePaymentConfig = (total, serviceType) => {
        const rules = getServicePaymentRules(serviceType)
        const base = { totalAmount: total, depositAmount: 0, nbMensualites: 0, monthlyPayment: 0 }

        if (rules.defaultPaymentType === 'monthly') return { ...base, nbMensualites: rules.monthlyInstallments, monthlyPayment: total / rules.monthlyInstallments }
        if (rules.defaultPaymentType === 'deposit') return { ...base, depositAmount: total * rules.depositRate }
        return base // full payment
    }

    // Payment config based on user choice
    const getServicePaymentConfigByChoice = (total, serviceType, paymentChoice) => {
        const rules = getServicePaymentRules(serviceType)
        const base = { totalAmount: total, depositAmount: 0, nbMensualites: 0, monthlyPayment: 0 }

        if (paymentChoice === 'monthly' && rules.monthlyInstallments > 0) return { ...base, nbMensualites: rules.monthlyInstallments, monthlyPayment: total / rules.monthlyInstallments }
        if (paymentChoice === 'deposit' && rules.depositRate > 0) return { ...base, depositAmount: total * rules.depositRate }
        return base // full payment
    }

    return { normalizeServiceType, getServicePaymentRules, getServicePaymentConfig, getServicePaymentConfigByChoice }
}