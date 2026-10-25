<template>
    <!-- Stripe card fees of each card type, printed in the payment terms of a contract -->
    <div class="stripe-fees-detail">
        <strong>{{ t('stripeFeesInfo') }}:</strong>
        <ul class="bullet-list">
            <li>
                {{ t('monthlyNetAmount') }}:
                <span class="amount-value">{{ formatPrice(netAmount) }}</span>
            </li>
            <li v-for="rate in rates" :key="rate.type">
                {{ t('processingFees') }} ({{ rate.label }}):
                <span class="amount-value">{{ formatPrice(rate.fees) }}</span>
                → {{ t('monthlyTotalAmount') }}:
                <span class="amount-value">{{ formatPrice(rate.total) }}</span>
            </li>
            <li>
                {{ t('totalOver12Months') }} (EEE standard):
                <span class="amount-value">{{ formatPrice(rates[0].total * months) }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed } from 'vue'

const { getTranslation: t } = useLang()

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
