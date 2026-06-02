// Stripe fee rates by card origin (France, 2026 — source: stripe.com/fr/pricing)
const STRIPE_RATES = {
    european: { percent: 0.015, fixed: 0.25 },  // Standard EEA card: 1.5% + €0.25
    europeanPremium: { percent: 0.019, fixed: 0.25 },  // Premium EEA card (business/corporate): 1.9% + €0.25
    uk: { percent: 0.025, fixed: 0.25 },  // British card: 2.5% + €0.25
    nonEuropean: { percent: 0.0325, fixed: 0.25 }   // International card: 3.25% + €0.25
}

// Computes Stripe fees and final charge using reverse formula:
// total = (amount + fixed) / (1 - percent)
// Uses Math.ceil on cents to match Stripe's rounding behavior (no fractional cents)
export const calculateStripeFees = (amount, cardType = 'european') => {
    const { percent, fixed } = STRIPE_RATES[cardType] ?? STRIPE_RATES.european

    // Raw total before rounding
    const rawTotal = (amount + fixed) / (1 - percent)

    // Stripe always rounds up to the nearest cent
    const totalCents = Math.ceil(rawTotal * 100)

    // Convert back to euros — this is the exact amount Stripe will charge
    const total = totalCents / 100

    // Fees = difference between what the customer pays and the net amount received
    const fees = Math.round((total - amount) * 100) / 100

    return {
        fees,
        total,
        totalCents
    }
}