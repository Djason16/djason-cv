<template>
    <!-- Use OtherSectionLayout to display the payment page content -->
    <OtherSectionLayout pageTitleKey="payMeTitle" pageSubtitleKey="payMeIntro" :sections="payMeSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="{ name: personalInfo.name, email: personalInfo.email }">

        <!-- Custom Stripe payment form -->
        <template v-slot:custom-content>
            <div class="stripe-payment-form">
                <!-- Animated container for the payment form fields -->
                <SlideInFromRight>
                    <!-- Email input field -->
                    <div class="form-group text-large">
                        <label for="email">{{ $lang.getTranslation('emailAddress') }}</label>
                        <input type="email" id="email" v-model="email" :placeholder="$lang.getTranslation('enterEmail')"
                            required />
                    </div>

                    <!-- Payment amount input field -->
                    <div class="form-group text-large">
                        <label for="amount">{{ $lang.getTranslation('amountToPay') }}</label>
                        <input type="number" id="amount" v-model="amount"
                            :placeholder="$lang.getTranslation('enterAmount')" min="1" />
                    </div>

                    <!-- Currency selection dropdown -->
                    <div class="form-group text-large">
                        <label for="currency">{{ $lang.getTranslation('currency') }}</label>
                        <select id="currency" v-model="currency">
                            <option value="usd">{{ $lang.getTranslation('usdCurrency') }}</option>
                            <option value="eur">{{ $lang.getTranslation('eurCurrency') }}</option>
                        </select>
                    </div>

                    <!-- Submit button for initiating the payment -->
                    <div class="stripe-payment-form">
                        <HeroButton :label="$lang.getTranslation('payButtonText')"
                            :ariaLabel="$lang.getTranslation('payWithStripe')" iconClass="fas fa-credit-card"
                            @click="startCheckout" />
                    </div>
                </SlideInFromRight>

                <!-- Display messages for payment status (e.g., success or error) -->
                <div class="message-display text-large text-bold" v-if="message">
                    <p :class="message.type">{{ $lang.getTranslation(message.key) }}</p>
                </div>
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#app'; // Nuxt app context and runtime configuration
import { personalInfo } from "@/utils/personalInfo.js"; // Personal data (e.g., name, email)
import { computed, ref } from 'vue'; // Vue 3 composition API
import HeroButton from '~/components/ui/Button/HeroButton.vue'; // Reusable button component
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'; // Reusable layout component
import SlideInFromRight from '../components/animations/SlideInFromRight.vue'; // Custom animation component
import { seoMetaData } from "../utils/seo.js"; // SEO configuration utility

// Current language context
const { $lang } = useNuxtApp();

// Define sections for the payment page
const payMeSections = [
    { titleKey: 'payMeSection1Title', contentKey: 'payMeSection1Content' },
    { titleKey: 'payMeSection2Title', contentKey: 'payMeSection2Content' },
    { titleKey: 'payMeSection3Title', contentKey: 'payMeSection3Content' },
    { titleKey: 'payMeSection4Title', contentKey: 'payMeSection4Content' },
    { titleKey: 'payMeSection5Title', contentKey: 'payMeSection5Content' },
    { titleKey: 'payMeSection6Title', contentKey: 'payMeSection6Content' },
    { titleKey: 'payMeSection7Title', contentKey: 'payMeSection7Content' },
    { titleKey: 'payMeSection8Title', contentKey: 'payMeSection8Content' },
    { titleKey: 'payMeSection9Title', contentKey: 'payMeSection9Content' },
];

// Set dynamic metadata for SEO purposes
const pageKey = 'payMe';
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));
});

// Access runtime configuration (e.g., API URLs)
const runtimeConfig = useRuntimeConfig();

// Reactive state for payment form fields and messages
const amount = ref(0); // Payment amount
const currency = computed(() => ($lang.current.value === 'french' ? 'eur' : 'usd')); // Dynamically determine currency based on language
const email = ref(''); // Customer email address
const message = ref(null); // Payment status message

/**
 * Start the Stripe checkout process.
 * Validates input fields and sends data to the backend to create a Stripe session.
 */
const startCheckout = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email validation regex

    // Validate payment amount
    if (amount.value <= 0) {
        message.value = { key: 'invalidAmount', type: 'error' };
        return;
    }

    // Validate email format
    if (!email.value || !emailRegex.test(email.value)) {
        message.value = { key: 'invalidEmail', type: 'error' };
        return;
    }

    try {
        // Create a Stripe checkout session
        const response = await fetch(`${runtimeConfig.public.backendDomain}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: amount.value * 100, // Convert amount to cents
                currency: currency.value, // Selected currency
                email: email.value, // User's email
            }),
        });

        const data = await response.json();

        // Open the Stripe checkout page in a popup
        if (data.url && data.sessionId) {
            const popup = window.open(
                data.url,
                'Stripe Checkout',
                'width=500,height=700,resizable,scrollbars=yes,status=1'
            );

            // Poll to check if the popup has closed
            const interval = setInterval(() => {
                if (popup.closed) {
                    clearInterval(interval);
                    checkPaymentStatus(data.sessionId); // Check the payment status
                }
            }, 1000);
        } else {
            throw new Error('No URL or session ID received from backend.');
        }
    } catch (error) {
        console.error('Frontend error:', error); // Log the error
        message.value = { key: 'checkoutError', type: 'error' }; // Display an error message
    }
};

/**
 * Check the status of the payment after Stripe checkout.
 * @param {string} sessionId - The ID of the Stripe session to check.
 */
const checkPaymentStatus = async (sessionId) => {
    try {
        const response = await fetch(`${runtimeConfig.public.backendDomain}/stripe/check-payment-status?sessionId=${sessionId}`, {
            method: 'GET',
        });
        const data = await response.json();

        // Update message based on payment status
        if (data.success) {
            message.value = { key: 'successPayment', type: 'success' }; // Payment successful
        } else {
            message.value = { key: 'cancelPayment', type: 'error' }; // Payment canceled or failed
        }
    } catch (error) {
        console.error('Error checking payment status:', error); // Log the error
        message.value = { key: 'unknownError', type: 'error' }; // Display an error message
    }
};
</script>

<style scoped>
.stripe-payment-form {
    text-align: left;
    margin-top: 2rem;
}

.form-group {
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    justify-content: left;
    gap: .25rem;
}

.message-display p {
    margin-top: 2rem;
    text-align: center;
    padding: 1rem;
    border-radius: 4px;
    max-width: 30rem;
}

.message-display p.success {
    color: var(--accent-green);
    background-color: rgba(30, 255, 0, 0.1);
}

.message-display p.error {
    color: var(--accent-red);
    background-color: rgba(255, 0, 0, 0.1);
}
</style>
