<template>
    <OtherSectionLayout pageTitleKey="payMeTitle" pageSubtitleKey="payMeIntro" :sections="payMeSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)"
        :dynamicData="{ name: config.public.name, email: config.public.contactEmail, phone: config.public.contactPhone }">
        <template v-slot:custom-content>
            <div class="stripe-payment-form">
                <SlideInFromRight>
                    <!-- Dynamic form fields -->
                    <div v-for="field in formFields" :key="field.id" class="form-group text-large">
                        <label :for="field.id">{{ $lang.getTranslation(field.labelKey) }}</label>

                        <input v-if="field.type !== 'select'" :type="field.type" :id="field.id"
                            v-model="formData[field.model]" :placeholder="$lang.getTranslation(field.placeholderKey)"
                            :min="field.min" :required="field.required" :autocomplete="field.autocomplete"
                            form="payment-dummy-form" @keyup.enter="startCheckout"
                            :aria-label="$lang.getTranslation(field.labelKey)"
                            :title="$lang.getTranslation(field.labelKey)" />

                        <select v-else :id="field.id" v-model="formData[field.model]" :autocomplete="field.autocomplete"
                            form="payment-dummy-form" :aria-label="$lang.getTranslation(field.labelKey)"
                            :title="$lang.getTranslation(field.labelKey)">
                            <option v-for="option in field.options" :key="option.value" :value="option.value"
                                :title="$lang.getTranslation(option.labelKey)">
                                {{ $lang.getTranslation(option.labelKey) }}
                            </option>
                        </select>
                    </div>

                    <!-- Payment button -->
                    <HeroButton :label="$lang.getTranslation('payButtonText')"
                        :ariaLabel="$lang.getTranslation('payButtonText')"
                        :title="$lang.getTranslation('payButtonText')" iconClass="fas fa-credit-card"
                        @click="startCheckout" />
                </SlideInFromRight>

                <!-- Messages -->
                <MessageBox :message="translatedMessage" />

                <!-- Hidden form for browser validation -->
                <form id="payment-dummy-form" @submit.prevent="startCheckout" style="display: none;"></form>
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useHead, useNuxtApp, useRuntimeConfig } from '#app'
import { seoMetaData } from '@/utils/seo.js'
import { computed, onMounted, reactive, watch } from 'vue'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useMessage } from '~/composables/useMessage'

const { $lang } = useNuxtApp()
const config = useRuntimeConfig()

// Define layout sections
const payMeSections = Array.from({ length: 9 }, (_, i) => ({
    titleKey: `payMeSection${i + 1}Title`,
    contentKey: `payMeSection${i + 1}Content`
}))

// SEO metadata, reactive to language changes
const pageKey = 'payMe'
useSeoMeta(seoMetaData(pageKey, $lang, {
    name: config.public.name,
    email: config.public.contactEmail,
    phone: config.public.contactPhone
}))
watch(() => $lang.current.value, () =>
    useSeoMeta(seoMetaData(pageKey, $lang, {
        name: config.public.name,
        email: config.public.contactEmail,
        phone: config.public.contactPhone
    }))
)

// Reactive form state
const formData = reactive({
    email: '',
    amount: 0,
    currency: computed(() => $lang.current.value === 'french' ? 'eur' : 'usd')
})

// Message composable
const { translatedMessage, showMessage, clearMessage } = useMessage()

// Define form fields
const formFields = [
    { id: 'email', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', required: true, autocomplete: 'email' },
    { id: 'amount', type: 'number', model: 'amount', labelKey: 'amountToPay', placeholderKey: 'enterAmount', min: 1, required: true, autocomplete: 'off' },
    {
        id: 'currency',
        type: 'select',
        model: 'currency',
        labelKey: 'currency',
        options: [
            { value: 'usd', labelKey: 'usdCurrency' },
            { value: 'eur', labelKey: 'eurCurrency' }
        ],
        autocomplete: 'off'
    }
]

// Trigger Stripe checkout with validation
const startCheckout = async () => {
    clearMessage()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.amount <= 0) return showMessage('error', 'invalidAmount', 0)
    if (!formData.email || !emailRegex.test(formData.email)) return showMessage('error', 'invalidEmail', 0)

    try {
        const data = await $fetch('/api/stripe/create-checkout', {
            method: 'POST',
            body: { amount: formData.amount * 100, currency: formData.currency, email: formData.email }
        })
        if (!data.url || !data.sessionId) throw new Error('Missing URL/sessionId')

        const popup = window.open(data.url, 'Stripe Checkout', 'width=500,height=700,resizable,scrollbars=yes,status=1')
        const interval = setInterval(() => {
            if (popup.closed) {
                clearInterval(interval)
                checkPaymentStatus(data.sessionId)
            }
        }, 1000)
    } catch (err) {
        console.error('Checkout error:', err)
        showMessage('error', 'checkoutError', 0)
    }
}

// Poll Stripe API for payment status
const checkPaymentStatus = async sessionId => {
    try {
        const data = await $fetch(`/api/stripe/check-payment?sessionId=${sessionId}`)
        showMessage(data.success ? 'success' : 'error', data.success ? 'successPayment' : 'cancelPayment', data.success ? 5000 : 0)
    } catch (err) {
        console.error('Status check error:', err)
        showMessage('error', 'unknownError', 0)
    }
}

// Dynamically load Stripe script if not present
onMounted(() => {
    if (!window.Stripe) useHead({ script: [{ src: 'https://js.stripe.com/v3/', defer: true, crossorigin: 'anonymous' }] })
})
</script>

<style scoped>
.stripe-payment-form {
    text-align: left;
    margin-top: 2rem
}

.form-group {
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: .25rem;
    justify-content: left
}
</style>