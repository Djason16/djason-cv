<template>
    <!-- Late payment article of the contract: different rules for individuals and professionals -->
    <section class="section">
        <h3 class="section-title text-large text-bold">5. {{ t('latePayment') }}</h3>

        <!-- Individual client: formal notice required, no fixed penalty fee -->
        <template v-if="!isPro">
            <p class="section-text text-small">{{ t('latePaymentIntro_individual', {
                rate:
                    ratePercentage
            }) }}</p>

            <div class="example-box text-small">
                <p class="info-label">{{ t('example') }}:</p>
                <p
                    v-html="t('latePaymentExample_individual', { subject, amount, days, divisor: divisorFormatted, interest, total })">
                </p>
            </div>
        </template>

        <!-- Professional client: penalties and fixed recovery fee apply automatically -->
        <template v-else>
            <p class="section-text text-small">{{ t('latePaymentIntro_pro') }}</p>

            <ul class="bullet-list text-small">
                <li>{{ t('latePaymentPenaltyPro', { penalty }) }}</li>
                <li>{{ t('latePaymentInterest', { rate: ratePercentage }) }}</li>
            </ul>

            <div class="example-box text-small">
                <p class="info-label">{{ t('example') }}:</p>
                <p
                    v-html="t('latePaymentExample_pro', { subject, amount, days, penalty, divisor: divisorFormatted, interest, total })">
                </p>
            </div>
        </template>

        <p class="section-text text-small">{{ t('suspensionRight') }}</p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed } from 'vue'
import { isProfessionalType } from '@/utils/clientTypes.js'

const { getTranslation: t } = useLang()

const props = defineProps({
    interestRate: { type: Number, default: null },
    clientType: { type: String, default: 'individual' },
    // Paid in monthly installments (Stripe subscription): the example is a late installment, otherwise a late payment
    isSubscription: { type: Boolean, default: false },
})

// True for company, freelance, association — false for individual
const isPro = computed(() => isProfessionalType(props.clientType))

// What is late in the example
const subject = computed(() => t(props.isSubscription ? 'latePaymentSubjectMonthly' : 'latePaymentSubjectSingle'))

// Example amounts
const amount = 55
const days = 15
const penalty = 40

const divisor = computed(() => props.interestRate ? props.interestRate / 365 : 0)
const divisorFormatted = computed(() => divisor.value.toLocaleString('fr-FR', { minimumFractionDigits: 10, maximumFractionDigits: 10 }))
const ratePercentage = computed(() => props.interestRate ? `${(props.interestRate * 100).toFixed(2)}%` : '—')
const interest = computed(() => props.interestRate ? (amount * divisor.value * days).toFixed(2) : 0)

// Total differs: pro includes fixed penalty, individual does not
const total = computed(() => {
    if (!props.interestRate) return 0
    const base = isPro.value ? amount + penalty : amount
    return (base + parseFloat(interest.value)).toFixed(2)
})
</script>

<style scoped>
/* Example of late payment interest, highlighted */
.example-box {
    background-color: rgba(255, 0, 0, 0.05);
    border: 1px solid var(--accent-red);
    padding: 12px;
    margin-bottom: 16px
}
</style>
