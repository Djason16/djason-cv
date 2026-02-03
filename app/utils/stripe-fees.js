// Computes Stripe fees and final charge using (amount + 0.25) / 0.985
export const calculateStripeFees = amount => {
    const total = (amount + 0.25) / 0.985
    const fees = total - amount

    return {
        fees: Math.round(fees * 100) / 100,        // Fees in euros, rounded to 2 decimals
        total: Math.round(total * 100) / 100,      // Total charge in euros
        totalCents: Math.ceil(total * 100)         // Total charge in cents
    }
}