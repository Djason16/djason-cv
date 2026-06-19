<template>
    <!-- Show payment method and due info; adapt due info for non-company clients with installments -->
    <div class="payment-conditions text-small">
        <strong>{{ $lang.getTranslation('paymentMethod') }}:</strong> {{ paymentMethod }}<br />
        <strong>{{ $lang.getTranslation('due') }}:</strong>
        {{ !isCompanyType(clientType) && nbMensualites > 0 ? monthlyPaymentInfo : paymentDue }}
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app';
import { isCompanyType } from '~/utils/clientTypes';

const props = defineProps({
    paymentMethod: String,
    nbMensualites: Number,
    monthlyPaymentInfo: String,
    paymentDue: String,
    clientType: String
})

const { $lang } = useNuxtApp()
</script>

<style scoped>
.payment-conditions {
    margin-bottom: 30px;
    color: var(--text-color-dark);
}
</style>