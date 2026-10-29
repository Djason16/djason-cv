<template>
    <!-- Payment options offered on a quote (full payment, deposit, monthly payments) -->
    <div class="payment-options text-small">
        <strong>{{ t('paymentOptionsTitle') }}:</strong>
        <div class="options-list">
            <div v-for="(opt, idx) in Object.values(paymentOptions).filter(o => o.description)" :key="idx"
                class="option-item">
                <strong v-if="paymentOptions.hasMultipleOptions">
                    {{ t('option') }} {{ idx + 1 }}:
                </strong>
                <strong v-else>{{ opt.description }}</strong>
                {{ paymentOptions.hasMultipleOptions ? opt.description : '' }}<br />
                <span v-if="opt.type === 'monthly'">
                    → {{ formatPrice(opt.monthlyPayment) }}/{{ t('month') }}
                    {{ t('during') }} {{ opt.nbMensualites }} {{ t('months') }}
                </span>
                <span v-else-if="opt.type === 'deposit'">
                    → {{ t('deposit') }}: {{ formatPrice(opt.depositAmount) }}<br />
                    → {{ t('balance') }}: {{ formatPrice(opt.remainingToPay) }}
                </span>
                <span v-else-if="opt.type === 'full'">
                    → {{ t('totalAmount') }}: {{ formatPrice(opt.remainingToPay) }}
                </span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { formatPrice as formatDocumentPrice } from '@/utils/documents.js'
import { useLang } from '@/composables/useLang.js'

defineProps({ paymentOptions: Object })
const lang = useLang()
const { getTranslation: t } = lang

// Formats price according to locale
const formatPrice = v => formatDocumentPrice(v, lang.current.value)
</script>
