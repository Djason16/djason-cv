import Stripe from 'stripe'

let stripeInstance = null

// Return a singleton Stripe instance
export const getStripeInstance = () => {
    if (!stripeInstance) stripeInstance = new Stripe(useRuntimeConfig().stripeSecretKey)
    return stripeInstance
}