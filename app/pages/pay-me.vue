<template>
    <!-- Payment page rendered via reusable layout -->
    <OtherSectionLayout pageTitleKey="payMeTitle" pageSubtitleKey="payMeIntro" :sections="payMeSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="{ name: personalInfo.name, email: personalInfo.email }">
        <!-- Custom slot for Stripe form -->
        <template v-slot:custom-content>
            <div class="stripe-payment-form">
                <SlideInFromRight>
                    <!-- Generate form fields dynamically -->
                    <div v-for="field in formFields" :key="field.id" class="form-group text-large">
                        <label :for="field.id">{{ $lang.getTranslation(field.labelKey) }}</label>

                        <input v-if="field.type !== 'select'" :type="field.type" :id="field.id"
                            v-model="formData[field.model]" :placeholder="$lang.getTranslation(field.placeholderKey)"
                            :min="field.min" :required="field.required" />

                        <select v-else :id="field.id" v-model="formData[field.model]">
                            <option v-for="option in field.options" :key="option.value" :value="option.value">
                                {{ $lang.getTranslation(option.labelKey) }}
                            </option>
                        </select>
                    </div>

                    <!-- Payment button triggers checkout -->
                    <HeroButton :label="$lang.getTranslation('payButtonText')"
                        :ariaLabel="$lang.getTranslation('payWithStripe')" iconClass="fas fa-credit-card"
                        @click="startCheckout" />
                </SlideInFromRight>

                <!-- Display dynamic messages (success/error) -->
                <div v-if="message" class="message-display text-large text-bold">
                    <p :class="message.type">{{ $lang.getTranslation(message.key) }}</p>
                </div>
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#app'
import { personalInfo } from '@/utils/personalInfo.js'
import { seoMetaData } from '@/utils/seo.js'
import { computed, reactive, ref, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import SlideInFromRight from '../components/animations/SlideInFromRight.vue'

const { $lang } = useNuxtApp()
const runtimeConfig = useRuntimeConfig()

// Dynamic sections for layout
const payMeSections = Array.from({ length: 9 }, (_, i) => ({
    titleKey: `payMeSection${i + 1}Title`,
    contentKey: `payMeSection${i + 1}Content`
}))

// Initial SEO setup & reactive update on language change
const pageKey = 'payMe'
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang, personalInfo)))

// Reactive form data and validation
const formData = reactive({ email: '', amount: 0, currency: computed(() => $lang.current.value === 'french' ? 'eur' : 'usd') })
const message = ref(null)

// Form fields config
const formFields = [
    { id: 'email', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', required: true },
    { id: 'amount', type: 'number', model: 'amount', labelKey: 'amountToPay', placeholderKey: 'enterAmount', min: 1, required: true },
    {
        id: 'currency', type: 'select', model: 'currency', labelKey: 'currency', options: [
            { value: 'usd', labelKey: 'usdCurrency' }, { value: 'eur', labelKey: 'eurCurrency' }
        ]
    }
]

// Initiate Stripe checkout with validation
const startCheckout = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.amount <= 0) return message.value = { key: 'invalidAmount', type: 'error' }
    if (!formData.email || !emailRegex.test(formData.email)) return message.value = { key: 'invalidEmail', type: 'error' }

    try {
        const res = await fetch(`${runtimeConfig.public.backendDomain}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: formData.amount * 100, currency: formData.currency, email: formData.email })
        })
        const data = await res.json()
        if (!data.url || !data.sessionId) throw new Error('Missing URL/sessionId')

        const popup = window.open(data.url, 'Stripe Checkout', 'width=500,height=700,resizable,scrollbars=yes,status=1')
        const interval = setInterval(() => {
            if (popup.closed) { clearInterval(interval); checkPaymentStatus(data.sessionId) }
        }, 1000)
    } catch (err) {
        console.error('Checkout error:', err)
        message.value = { key: 'checkoutError', type: 'error' }
    }
}

// Check Stripe payment status
const checkPaymentStatus = async sessionId => {
    try {
        const res = await fetch(`${runtimeConfig.public.backendDomain}/stripe/check-payment-status?sessionId=${sessionId}`)
        const data = await res.json()
        message.value = { key: data.success ? 'successPayment' : 'cancelPayment', type: data.success ? 'success' : 'error' }
    } catch (err) {
        console.error('Status check error:', err)
        message.value = { key: 'unknownError', type: 'error' }
    }
}
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
