import Stripe from 'stripe'

let stripeInstance = null

// Return a singleton Stripe instance
export const getStripeInstance = () => {
    if (!stripeInstance) stripeInstance = new Stripe(useRuntimeConfig().stripeSecretKey)
    return stripeInstance
}

// Calculate total in cents including Stripe fees
export const calculateStripeTotal = amount => Math.ceil(amount * 1.029 + 30)