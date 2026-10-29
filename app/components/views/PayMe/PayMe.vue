<template>
    <!-- Online payment with Stripe Checkout: a one-time payment or a 12-month subscription (web development) -->
    <OtherSectionLayout pageTitleKey="payMeTitle" pageSubtitleKey="payMeIntro" :sections="payMeSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)"
        :dynamicData="{ name: site.name, email: site.email, phone: site.phone, refundPolicyUrl: '/refund-policy' }">
        <template #custom-content>
            <div class="stripe-payment-form">
                <SlideInFromRight>
                    <!-- Fields of the current mode (Enter starts the payment) -->
                    <div v-for="field in current.fields" :key="field.id" class="form-group text-large">
                        <label :for="field.id">{{ t(field.labelKey) }}</label>

                        <select v-if="field.options" :id="field.id" v-model="formData[field.model]" autocomplete="off"
                            :aria-label="t(field.labelKey)" :title="t(field.labelKey)">
                            <option v-for="option in field.options" :key="option.value" :value="option.value"
                                :title="t(option.labelKey)">
                                {{ t(option.labelKey) }}
                            </option>
                        </select>

                        <input v-else :id="field.id" v-model="formData[field.model]" :type="field.type" :min="field.min"
                            :placeholder="t(field.placeholderKey)" required
                            :autocomplete="field.autocomplete" :aria-label="t(field.labelKey)"
                            :title="t(field.labelKey)" @keyup.enter="startCheckout" />
                    </div>

                    <!-- Pay, then switch to the other mode -->
                    <div class="payment-buttons">
                        <HeroButton :label="t(current.payKey)" :iconClass="current.payIcon"
                            :aria-label="t(current.payKey)" :title="t(current.payKey)"
                            @click="startCheckout" />
                        <HeroButton :label="t(current.switchKey)" :iconClass="current.switchIcon"
                            :aria-label="t(current.switchKey)"
                            :title="t(current.switchKey)" @click="switchMode" />
                    </div>
                </SlideInFromRight>

                <MessageBox :message="translatedMessage" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import SlideInFromRight from '@/components/ui/Animation/SlideInFromRight.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useLang } from '@/composables/useLang.js'
import { useMessage } from '@/composables/useMessage.js'
import { useSite } from '@/composables/useSite.js'
import { api } from '@/utils/api.js'

const lang = useLang()
const { getTranslation: t } = lang
const site = useSite()
const { translatedMessage, showMessage, clearMessage } = useMessage()

// Currency follows the language (EUR in French, USD in English), the visitor can change it
const formData = reactive({ email: '', name: '', amount: 0, currency: 'eur', cardType: 'european' })
watch(() => lang.current.value, code => { formData.currency = code === 'fr' ? 'eur' : 'usd' }, { immediate: true })

// Fields shared by the one-time payment and the subscription forms
const currencyField = id => ({
    id, model: 'currency', labelKey: 'currency',
    options: [{ value: 'eur', labelKey: 'eurCurrency' }, { value: 'usd', labelKey: 'usdCurrency' }],
})
const cardTypeField = id => ({
    id, model: 'cardType', labelKey: 'cardType',
    options: [
        { value: 'european', labelKey: 'europeanCard' },
        { value: 'europeanPremium', labelKey: 'europeanPremiumCard' },
        { value: 'uk', labelKey: 'ukCard' },
        { value: 'nonEuropean', labelKey: 'nonEuropeanCard' },
    ],
})
const emailField = id => ({ id, type: 'email', model: 'email', labelKey: 'payMeEmailAddress', placeholderKey: 'payMeEnterEmail', autocomplete: 'email' })

/*
 * The two payment modes (server side: server/controllers/StripeController.js):
 *   create = Checkout session, check = status once the Stripe popup is closed (flag = field of the answer)
 */
const MODES = {
    payment: {
        fields: [emailField('email'), { id: 'amount', type: 'number', model: 'amount', labelKey: 'amountToPay', placeholderKey: 'enterAmount', min: 1, autocomplete: 'off' }, currencyField('currency'), cardTypeField('cardType')],
        payKey: 'payButtonText', payIcon: 'fas fa-credit-card',
        switchKey: 'subscribeForWebDev', switchIcon: 'fas fa-calendar-alt',
        // Amount in cents for a one-time payment
        create: () => api.post('/stripe/create-checkout', { amount: formData.amount * 100, currency: formData.currency, email: formData.email, cardType: formData.cardType }),
        check: '/stripe/check-payment', flag: 'paid', successKey: 'successPayment', cancelKey: 'cancelPayment',
    },
    subscription: {
        fields: [{ id: 'name', type: 'text', model: 'name', labelKey: 'fullName', placeholderKey: 'enterName', autocomplete: 'name' }, emailField('email-sub'), { id: 'total-amount', type: 'number', model: 'amount', labelKey: 'totalProjectAmount', placeholderKey: 'payMeEnterTotalAmount', min: 1, autocomplete: 'off' }, currencyField('currency-sub'), cardTypeField('cardType-sub')],
        payKey: 'subscribeButton', payIcon: 'fas fa-calendar-check',
        switchKey: 'backToOneTimePayment', switchIcon: 'fas fa-arrow-left',
        // Total amount in euros, split into 12 monthly payments by the server
        create: () => api.post('/stripe/create-subscription', { amount: formData.amount, currency: formData.currency, email: formData.email, name: formData.name.trim(), cardType: formData.cardType }),
        check: '/stripe/check-subscription', flag: 'active', successKey: 'successSubscription', cancelKey: 'cancelSubscription',
    },
}
const mode = ref('payment')
const current = computed(() => MODES[mode.value])

// Other mode: currency and card type are kept
const switchMode = () => {
    mode.value = mode.value === 'payment' ? 'subscription' : 'payment'
    clearMessage()
    Object.assign(formData, { email: '', name: '', amount: 0 })
}

// Result of the Stripe session once its popup is closed
const checkStatus = async (modeConfig, sessionId) => {
    const res = await api.get(`${modeConfig.check}?sessionId=${encodeURIComponent(sessionId)}`)
    if (!res.success) return showMessage('error', 'unknownError', 0)
    const ok = res[modeConfig.flag]
    showMessage(ok ? 'success' : 'error', ok ? modeConfig.successKey : modeConfig.cancelKey, ok ? 5000 : 0)
}

// One-time payment: checks the amount, then opens the Stripe payment page
const startCheckout = async () => {
    clearMessage()
    if (formData.amount <= 0) return showMessage('error', 'invalidAmount', 0)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '')) return showMessage('error', 'invalidEmail', 0)
    if (mode.value === 'subscription' && !/^.{2,50}$/.test(formData.name.trim())) return showMessage('error', 'invalidName', 0)

    const modeConfig = current.value
    const session = await modeConfig.create()
    if (!session.success || !session.url || !session.sessionId) return showMessage('error', 'checkoutError', 0)

    // Stripe Checkout in a popup, checked as soon as the visitor closes it
    const popup = window.open(session.url, 'Stripe Checkout', 'width=500,height=700,resizable,scrollbars=yes,status=1')
    const timer = setInterval(() => {
        if (!popup || popup.closed) {
            clearInterval(timer)
            checkStatus(modeConfig, session.sessionId)
        }
    }, 1000)
}

const payMeSections = Array.from({ length: 10 }, (_, i) => ({ titleKey: `payMeSection${i + 1}Title`, contentKey: `payMeSection${i + 1}Content` }))
</script>

<style scoped>
/* Payment form */
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

/* Buttons under the form */
.payment-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
