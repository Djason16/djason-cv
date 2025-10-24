export const useFinancialCalculations = () => {
    // Calculate totals from missions array
    const calculateTotals = (missions) => {
        const totalHT = missions.reduce((sum, m) =>
            sum + (m.unit_price || 0) * (m.quantity || 1), 0)
        const totalTVA = missions.reduce((sum, m) =>
            sum + ((m.vat_applicable ? 0.2 : 0) * (m.unit_price || 0) * (m.quantity || 1)), 0)
        return { totalHT, totalTVA, totalTTC: totalHT + totalTVA }
    }

    // Calculate monthly payments with elapsed months
    const calculateMonthlyPayments = (total, firstDateStr, totalInstallments = 12) => {
        if (!firstDateStr) {
            return {
                monthlyPayment: total / totalInstallments,
                amountPaid: 0,
                remainingToPay: total,
                nbMensualites: totalInstallments,
                paymentDueDate: '',
                depositAmount: 0
            }
        }

        const [d, m, y] = firstDateStr.split('/')
        const first = new Date(`${y}-${m}-${d}`)
        const today = new Date()

        let monthsElapsed = (today.getFullYear() - first.getFullYear()) * 12 +
            (today.getMonth() - first.getMonth())
        if (today.getDate() < first.getDate()) monthsElapsed--
        monthsElapsed = Math.max(0, monthsElapsed + 1)

        const monthly = total / totalInstallments
        const amountPaid = monthly * Math.min(monthsElapsed, totalInstallments)
        const remaining = Math.max(0, total - amountPaid)

        return {
            monthlyPayment: monthly,
            amountPaid,
            remainingToPay: monthsElapsed >= totalInstallments ? 0 : remaining,
            nbMensualites: Math.max(0, totalInstallments - monthsElapsed),
            paymentDueDate: firstDateStr,
            depositAmount: 0
        }
    }

    // Calculate deposit payment
    const calculateDepositPayment = (total, depositPercent, dueDate = '') => {
        const deposit = total * depositPercent
        return {
            depositAmount: deposit,
            amountPaid: deposit,
            remainingToPay: total - deposit,
            nbMensualites: 0,
            monthlyPayment: 0,
            paymentDueDate: dueDate
        }
    }

    return { calculateTotals, calculateMonthlyPayments, calculateDepositPayment }
}