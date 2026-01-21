<template>
    <!-- Display payment options, adapting labels and details based on type -->
    <div class="payment-options text-small">
        <strong>{{ $lang.getTranslation('paymentOptionsTitle') }}:</strong>
        <div class="options-list">
            <div v-for="(opt, idx) in Object.values(paymentOptions).filter(o => o.description)" :key="idx"
                class="option-item">
                <strong v-if="paymentOptions.hasMultipleOptions">
                    {{ $lang.getTranslation('option') }} {{ idx + 1 }}:
                </strong>
                <strong v-else>{{ opt.description }}</strong>
                {{ paymentOptions.hasMultipleOptions ? opt.description : '' }}<br />
                <span v-if="opt.type === 'monthly'">
                    → {{ formatPrice(opt.monthlyPayment) }}/{{ $lang.getTranslation('month') }}
                    {{ $lang.getTranslation('during') }} {{ opt.nbMensualites }} {{ $lang.getTranslation('months') }}
                </span>
                <span v-else-if="opt.type === 'deposit'">
                    → {{ $lang.getTranslation('deposit') }}: {{ formatPrice(opt.depositAmount) }}<br />
                    → {{ $lang.getTranslation('balance') }}: {{ formatPrice(opt.remainingToPay) }}
                </span>
                <span v-else-if="opt.type === 'full'">
                    → {{ $lang.getTranslation('totalAmount') }}: {{ formatPrice(opt.remainingToPay) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'

const props = defineProps({ paymentOptions: Object })
const { $lang } = useNuxtApp()

// Format price according to locale
const formatPrice = v => $lang.locale.value === 'fr'
    ? `${(v ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : `$${(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
</script>

<style scoped>
.payment-options {
    margin-bottom: 30px;
    padding: 20px;
    background: #f7f9fb;
    border-left: 2px solid var(--third-color);
    color: var(--text-color-dark);
}

.options-list {
    margin-top: 15px;
}

.option-item {
    margin-bottom: 15px;
    padding: 10px;
    background: var(--zero-color);
}

.option-item:last-child {
    margin-bottom: 0;
}
</style>