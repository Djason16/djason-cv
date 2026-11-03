<!-- Online payment with Stripe Checkout: a one-time payment or a 12-month subscription (web development);
     opened from the payment link of a quote or an invoice (?doc=...): that document and its amount (PayDocument) -->
<template>
    <OtherSectionLayout pageTitleKey="payMeTitle" pageSubtitleKey="payMeIntro" :sections="payMeSections"
        :dynamicData="{ name: site.name, email: site.email, phone: site.phone, refundPolicyUrl: '/refund-policy' }">
        <template #custom-content>
            <PayDocument v-if="docToken" v-reveal :token="docToken" :auto-pdf="route.query.pdf === '1'" class="stripe-payment-form" />
            <div v-else v-reveal class="stripe-payment-form">
                <!-- One-time payment or annual plan: the form changes with a fade and a short rise -->
                <Transition name="swap" mode="out-in">
                    <div :key="mode">
                        <!-- Fields of the current mode (Enter starts the payment) -->
                        <div v-for="field in current.fields" :key="field.id" class="form-group text-label">
                            <label :for="field.id">{{ t(field.labelKey) }}</label>

                            <FormInput :id="field.id" v-model="formData[field.model]" :type="field.type" :min="field.min"
                                :options="field.options?.map(option => ({ value: option.value, label: t(option.labelKey) }))"
                                :placeholder="field.options ? undefined : t(field.placeholderKey)" :required="!field.options"
                                :autocomplete="field.options ? 'off' : field.autocomplete" :aria-label="t(field.labelKey)"
                                :title="t(field.labelKey)" @enter="startCheckout" />
                        </div>

                        <!-- Annual plan: what each month will cost -->
                    <p v-if="monthly" class="pay-monthly text-body">{{ t('payMonthly', { amount: monthly }) }}</p>

                        <!-- Pay, then switch to the other mode -->
                        <div class="payment-buttons">
                            <HeroButton primary :label="t(current.payKey)" :iconClass="current.payIcon"
                                :aria-label="t(current.payKey)" :title="t(current.payKey)"
                                @click="startCheckout" />
                            <HeroButton :label="t(current.switchKey)" :iconClass="current.switchIcon"
                                :aria-label="t(current.switchKey)"
                                :title="t(current.switchKey)" @click="switchMode" />
                        </div>
                    </div>
                </Transition>

                <MessageBox :message="translatedMessage" />

                <!-- A consumer can withdraw online (art. L.221-21 of the French Consumer Code) -->
                <p class="pay-withdrawal text-body-s">
                    {{ t('withdrawalHint') }} <NuxtLink :to="withTrailingSlash('/withdrawal')" :title="t('withdrawal')">{{ t('withdrawal') }} →</NuxtLink>
                </p>
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import FormInput from '@/components/ui/Form/FormInput.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'
import PayDocument from '@/components/views/PayMe/PayDocument.vue'
import { useLang } from '@/composables/useLang.js'
import { useMessage } from '@/composables/useMessage.js'
import { useSite } from '@/composables/useSite.js'
import { api } from '@/utils/api.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'

const lang = useLang()
const { getTranslation: t } = lang
const site = useSite()
const { translatedMessage, showMessage, clearMessage } = useMessage()
// Payment link of a document of the admin (/pay-me/?doc=...)
const route = useRoute()
const docToken = computed(() => typeof route.query.doc === 'string' ? route.query.doc : '')

// Currency follows the language (EUR in French, USD in English), the visitor can change it
// The client pays exactly the amount asked: no card fee is added (forbidden for consumer cards, art. L.112-12 of the French monetary code)
const formData = reactive({ email: '', name: '', amount: 0, currency: 'eur' })
watch(() => lang.current.value, code => { formData.currency = code === 'fr' ? 'eur' : 'usd' }, { immediate: true })

// Fields shared by the one-time payment and the subscription forms
const currencyField = id => ({
    id, model: 'currency', labelKey: 'currency',
    options: [{ value: 'eur', labelKey: 'eurCurrency' }, { value: 'usd', labelKey: 'usdCurrency' }],
})
const emailField = id => ({ id, type: 'email', model: 'email', labelKey: 'payMeEmailAddress', placeholderKey: 'payMeEnterEmail', autocomplete: 'email' })

/*
 * The two payment modes (server side: server/controllers/StripeController.js):
 *   create = Checkout session, check = status once the Stripe popup is closed (flag = field of the answer)
 */
const MODES = {
    payment: {
        fields: [emailField('email'), { id: 'amount', type: 'number', model: 'amount', labelKey: 'amountToPay', placeholderKey: 'enterAmount', min: 1, autocomplete: 'off' }, currencyField('currency')],
        payKey: 'payButtonText', payIcon: 'fas fa-credit-card',
        switchKey: 'subscribeForWebDev', switchIcon: 'fas fa-calendar-alt',
        // Amount in cents for a one-time payment
        create: () => api.post('/stripe/create-checkout', { amount: formData.amount * 100, currency: formData.currency, email: formData.email }),
        check: '/stripe/check-payment', flag: 'paid', successKey: 'successPayment', cancelKey: 'cancelPayment',
    },
    subscription: {
        fields: [{ id: 'name', type: 'text', model: 'name', labelKey: 'fullName', placeholderKey: 'enterName', autocomplete: 'name' }, emailField('email-sub'), { id: 'total-amount', type: 'number', model: 'amount', labelKey: 'totalProjectAmount', placeholderKey: 'payMeEnterTotalAmount', min: 1, autocomplete: 'off' }, currencyField('currency-sub')],
        payKey: 'subscribeButton', payIcon: 'fas fa-calendar-check',
        switchKey: 'backToOneTimePayment', switchIcon: 'fas fa-arrow-left',
        // Total amount in euros, split into 12 monthly payments by the server
        create: () => api.post('/stripe/create-subscription', { amount: formData.amount, currency: formData.currency, email: formData.email, name: formData.name.trim() }),
        check: '/stripe/check-subscription', flag: 'active', successKey: 'successSubscription', cancelKey: 'cancelSubscription',
    },
}
const mode = ref('payment')
const current = computed(() => MODES[mode.value])

// Annual plan: the amount of each month, shown before paying
const monthly = computed(() => {
    const amount = Number(formData.amount) || 0
    if (mode.value !== 'subscription' || amount <= 0) return ''
    return new Intl.NumberFormat(lang.current.value === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: formData.currency.toUpperCase() })
        .format(Math.round(amount / 12 * 100) / 100)
})

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

/* Label above its field (FormInput), like the forms of the admin */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 480px;
    margin-bottom: 1.5rem;
}

/* Annual plan: the amount of each month, on a mint mark */
.pay-monthly {
    max-width: 480px;
    margin: 0.5rem 0 2rem;
    padding: 0.9rem 1.1rem;
    border-left: 2px solid var(--accent);
    background: var(--panel);
    color: var(--fg);
}

/* Link to the online withdrawal, under the form */
.pay-withdrawal {
    margin: 2rem 0 0;
    color: var(--fg-muted);
}

.pay-withdrawal a {
    color: var(--accent);
}

/* Buttons under the form */
.payment-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
