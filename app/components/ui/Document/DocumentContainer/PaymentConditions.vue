<template>
    <!-- Show payment method and due info; adapt due info for individual clients with installments -->
    <div class="payment-conditions text-small">
        <strong>{{ $lang.getTranslation('paymentMethod') }}:</strong> {{ paymentMethod }}<br />
        <strong>{{ $lang.getTranslation('due') }}:</strong>
        {{ isIndividualType(clientType) && nbMensualites > 0 ? monthlyPaymentInfo : paymentDue }}
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app';

const props = defineProps({
    paymentMethod: String,
    nbMensualites: Number,
    monthlyPaymentInfo: String,
    paymentDue: String,
    clientType: String
})

const { $lang } = useNuxtApp()

// Check if client is individual
const isIndividualType = t => t === 'individual'
</script>

<style scoped>
.payment-conditions {
    margin-bottom: 30px;
    color: var(--text-color-dark);
}
</style>