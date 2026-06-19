<template>
    <!-- Late payment section: different rules apply for individual vs professional clients -->
    <section class="section">
        <h3 class="section-title text-large text-bold">5. {{ $lang.getTranslation('latePayment') }}</h3>

        <!-- Individual client: formal notice required, no fixed penalty fee -->
        <template v-if="!isPro">
            <p class="section-text text-small">{{ $lang.getTranslation('latePaymentIntro_individual', {
                rate:
                    ratePercentage
            }) }}</p>

            <div class="example-box text-small">
                <p class="info-label">{{ $lang.getTranslation('example') }}:</p>
                <p
                    v-html="$lang.getTranslation('latePaymentExample_individual', { amount, days, divisor: divisorFormatted, interest, total })">
                </p>
            </div>
        </template>

        <!-- Professional client: penalties and fixed recovery fee apply automatically -->
        <template v-else>
            <p class="section-text text-small">{{ $lang.getTranslation('latePaymentIntro_pro') }}</p>

            <ul class="bullet-list text-small">
                <li>{{ $lang.getTranslation('latePaymentPenaltyPro', { penalty }) }}</li>
                <li>{{ $lang.getTranslation('latePaymentInterest', { rate: ratePercentage }) }}</li>
            </ul>

            <div class="example-box text-small">
                <p class="info-label">{{ $lang.getTranslation('example') }}:</p>
                <p
                    v-html="$lang.getTranslation('latePaymentExample_pro', { amount, days, penalty, divisor: divisorFormatted, interest, total })">
                </p>
            </div>
        </template>

        <p class="section-text text-small">{{ $lang.getTranslation('suspensionRight') }}</p>
    </section>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'
import { isProfessionalType } from '~/utils/clientTypes'

const { $lang } = useNuxtApp()

const props = defineProps({
    interestRate: { type: Number, default: null },
    clientType: { type: String, default: 'individual' }
})

// True for company, freelance, association — false for individual
const isPro = computed(() => isProfessionalType(props.clientType))

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
.section {
    margin-bottom: 25px
}

.section-title {
    color: var(--third-color);
    margin-bottom: 12px;
    border-bottom: 2px solid var(--second-color);
    padding-bottom: 6px
}

.section-text {
    text-align: justify;
    margin-bottom: 16px;
    line-height: 1.8
}

.bullet-list {
    list-style: none;
    padding-left: 20px;
    margin: 0 0 16px 0;
    line-height: 1.8
}

.bullet-list li {
    margin-bottom: 8px;
    text-align: justify;
    position: relative;
    padding-left: 20px;
}

.bullet-list li::before {
    content: "• ";
    position: absolute;
    left: 0;
    font-weight: bold;
}

.example-box {
    background-color: rgba(255, 0, 0, 0.05);
    border: 1px solid var(--accent-red);
    padding: 12px;
    margin-bottom: 16px
}

.info-label {
    font-weight: 700;
    margin-bottom: 6px
}
</style>