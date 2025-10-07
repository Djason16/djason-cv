<template>
    <!-- Payment page via reusable layout -->
    <OtherSectionLayout pageTitleKey="payMeTitle" pageSubtitleKey="payMeIntro" :sections="payMeSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)"
        :dynamicData="{ name: personalInfo.name, email: personalInfo.email, phone: personalInfo.phone }">
        <template v-slot:custom-content>
            <div class="stripe-payment-form">
                <SlideInFromRight>
                    <!-- Render form fields dynamically -->
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

                <!-- Success/Error messages -->
                <MessageBox :message="translatedMessage" />

                <!-- Hidden form for browser validation -->
                <form id="payment-dummy-form" @submit.prevent="startCheckout" style="display: none;"></form>
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useHead, useNuxtApp } from '#app'
import { personalInfo } from '@/utils/personalInfo.js'
import { seoMetaData } from '@/utils/seo.js'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useTranslatedMessage } from '~/composables/useTranslatedMessage'

const { $lang } = useNuxtApp()

// Layout sections
const payMeSections = Array.from({ length: 9 }, (_, i) => ({
    titleKey: `payMeSection${i + 1}Title`,
    contentKey: `payMeSection${i + 1}Content`
}))

// SEO setup, update on language change
const pageKey = 'payMe'
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang, personalInfo)))

// Reactive form state and messages
const formData = reactive({
    email: '',
    amount: 0,
    currency: computed(() => $lang.current.value === 'french' ? 'eur' : 'usd')
})
const message = ref(null)

// Form field definitions
const formFields = [
    { id: 'email', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', required: true, autocomplete: 'email' },
    { id: 'amount', type: 'number', model: 'amount', labelKey: 'amountToPay', placeholderKey: 'enterAmount', min: 1, required: true, autocomplete: 'off' },
    {
        id: 'currency', type: 'select', model: 'currency', labelKey: 'currency', options: [
            { value: 'usd', labelKey: 'usdCurrency' },
            { value: 'eur', labelKey: 'eurCurrency' }
        ], autocomplete: 'off'
    }
]

// Computed reactive translation for current message
const { translatedMessage } = useTranslatedMessage(message)

// Validate and start Stripe checkout
const startCheckout = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.amount <= 0) return message.value = { key: 'invalidAmount', type: 'error' }
    if (!formData.email || !emailRegex.test(formData.email)) return message.value = { key: 'invalidEmail', type: 'error' }

    try {
        const data = await $fetch('/api/stripe/create-checkout', {
            method: 'POST',
            body: { amount: formData.amount * 100, currency: formData.currency, email: formData.email }
        })
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

// Poll Stripe API for payment result
const checkPaymentStatus = async sessionId => {
    try {
        const data = await $fetch(`/api/stripe/check-payment?sessionId=${sessionId}`)
        message.value = { key: data.success ? 'successPayment' : 'cancelPayment', type: data.success ? 'success' : 'error' }
        if (data.success) {
            setTimeout(() => message.value = null, 3000)
        }
    } catch (err) {
        console.error('Status check error:', err)
        message.value = { key: 'unknownError', type: 'error' }
    }
}

// Dynamically load Stripe script
const loadStripe = () => {
    if (!window.Stripe) useHead({ script: [{ src: 'https://js.stripe.com/v3/', defer: true, crossorigin: 'anonymous' }] })
}
onMounted(() => loadStripe())
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