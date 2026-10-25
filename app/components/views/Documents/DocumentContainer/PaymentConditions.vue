<template>
    <!-- Payment method and due date of the quote or invoice, installments for non-company clients -->
    <div class="payment-conditions text-small">
        <strong>{{ t('paymentMethod') }}:</strong> {{ paymentMethod }}<br />
        <strong>{{ t('due') }}:</strong>
        {{ !isCompanyType(clientType) && nbMensualites > 0 ? monthlyPaymentInfo : paymentDue }}
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
;
import { isCompanyType } from '@/utils/clientTypes.js';

const { getTranslation: t } = useLang()

defineProps({
    paymentMethod: String,
    nbMensualites: Number,
    monthlyPaymentInfo: String,
    paymentDue: String,
    clientType: String
})

</script>
