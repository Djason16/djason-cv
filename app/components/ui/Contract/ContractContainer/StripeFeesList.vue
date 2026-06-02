<template>
    <div class="stripe-fees-detail">
        <strong>{{ $lang.getTranslation('stripeFeesInfo') }}:</strong>
        <ul class="bullet-list">
            <li>
                {{ $lang.getTranslation('monthlyNetAmount') }}:
                <span class="amount-value">{{ formatPrice(netAmount) }}</span>
            </li>
            <li v-for="rate in rates" :key="rate.type">
                {{ $lang.getTranslation('processingFees') }} ({{ rate.label }}):
                <span class="amount-value">{{ formatPrice(rate.fees) }}</span>
                → {{ $lang.getTranslation('monthlyTotalAmount') }}:
                <span class="amount-value">{{ formatPrice(rate.total) }}</span>
            </li>
            <li>
                {{ $lang.getTranslation('totalOver12Months') }} (EEE standard):
                <span class="amount-value">{{ formatPrice(rates[0].total * months) }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'

const { $lang } = useNuxtApp()

const props = defineProps({
    netAmount: Number,
    months: { type: Number, default: 12 },
    calculateStripeFees: Function,
    formatPrice: Function
})

const rates = computed(() => [
    { label: 'EEE standard – 1,5% + 0,25€', type: 'european', ...props.calculateStripeFees(props.netAmount, 'european') },
    { label: 'EEE premium (business) – 1,9% + 0,25€', type: 'europeanPremium', ...props.calculateStripeFees(props.netAmount, 'europeanPremium') },
    { label: 'UK – 2,5% + 0,25€', type: 'uk', ...props.calculateStripeFees(props.netAmount, 'uk') },
    { label: 'hors EEE – 3,25% + 0,25€', type: 'nonEuropean', ...props.calculateStripeFees(props.netAmount, 'nonEuropean') },
])
</script>

<style scoped>
.stripe-fees-detail {
    background: #e3f2fd;
    border-left: 4px solid var(--accent-blue);
    padding: 10px;
    margin: 10px 0
}

.bullet-list {
    list-style: none;
    padding-left: 20px;
    margin: 8px 0 0 0
}

.bullet-list li {
    margin-bottom: 4px;
    text-align: justify;
    position: relative;
    padding-left: 20px
}

.bullet-list li::before {
    content: "• ";
    position: absolute;
    left: 0;
    font-weight: bold
}

.amount-value {
    font-weight: 700
}
</style>