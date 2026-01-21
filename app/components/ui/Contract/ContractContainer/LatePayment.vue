<template>
    <!-- Late payment section: penalties, interest, and example -->
    <section class="section">
        <h3 class="section-title text-large text-bold">5. {{ $lang.getTranslation('latePayment') }}</h3>
        <p class="section-text text-small">{{ $lang.getTranslation('latePaymentIntro') }}</p>

        <!-- Penalties and interest list -->
        <ul class="bullet-list text-small">
            <li>{{ $lang.getTranslation('latePaymentPenalty', { penalty }) }}</li>
            <li>{{ $lang.getTranslation('latePaymentInterest', { rate: ratePercentage }) }}</li>
        </ul>

        <!-- Example box with calculation or scenario -->
        <div class="example-box text-small">
            <p class="info-label">{{ $lang.getTranslation('example') }}:</p>
            <p
                v-html="$lang.getTranslation('latePaymentExample', { amount, days, penalty, divisor: divisorFormatted, interest, total })">
            </p>
        </div>

        <p class="section-text text-small">{{ $lang.getTranslation('suspensionRight') }}</p>
    </section>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed, onMounted, ref } from 'vue'

const { $lang } = useNuxtApp()
const rate = ref(null)

const amount = 55
const days = 15
const penalty = 40

const divisor = computed(() => rate.value ? rate.value / 365 : 0)
const divisorFormatted = computed(() => divisor.value.toLocaleString('fr-FR', { minimumFractionDigits: 10, maximumFractionDigits: 10 }))
const ratePercentage = computed(() => rate.value ? `${(rate.value * 100).toFixed(2)}%` : '—')
const interest = computed(() => rate.value ? (amount * divisor.value * days).toFixed(2) : 0)
const total = computed(() => rate.value ? (amount + penalty + parseFloat(interest.value)).toFixed(2) : 0)

onMounted(async () => {
    try {
        const response = await $fetch('/api/interest-rates/list')
        rate.value = response.rates?.rows?.[0]?.rate
    } catch (err) {
        console.error('Error fetching interest rate:', err)
    }
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