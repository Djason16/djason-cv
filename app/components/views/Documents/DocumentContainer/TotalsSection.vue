<template>
    <!-- Totals table: month concerned for companies, deposit/installments for all others -->
    <div class="totals-section">
        <table class="totals-table text-small">
            <tbody>
                <!-- Common rows for all clients -->
                <tr>
                    <td class="text-bold">{{ t('totalHt') }}</td>
                    <td class="text-bold">{{ formatPrice(totalHT) }}</td>
                </tr>
                <tr v-if="hasTVA">
                    <td class="text-bold">{{ t('totalTva') }}</td>
                    <td class="text-bold">{{ formatPrice(totalTVA) }}</td>
                </tr>
                <tr v-if="hasTVA">
                    <td class="text-bold">{{ t('totalTtc') }}</td>
                    <td class="text-bold">{{ formatPrice(isCompanyType(clientType) ? totalTTC : finalTotal) }}</td>
                </tr>

                <!-- Company only: month concerned (B2B monthly contract) -->
                <tr v-if="!isQuoteType && isCompanyType(clientType)">
                    <td class="text-bold">{{ t('monthConcerned') }}</td>
                    <td class="text-bold">{{ formatMonth(monthConcerned) }}</td>
                </tr>

                <!-- All non-company clients: deposit, remaining, installments -->
                <tr v-if="!isQuoteType && !isCompanyType(clientType) && (deposit || (nbMensualites && amountPaid))">
                    <td class="text-bold">{{ t('paid') }}</td>
                    <td class="text-bold">{{ formatPrice(amountPaid) }}</td>
                </tr>
                <tr v-if="!isQuoteType && !isCompanyType(clientType) && shouldShowRemaining">
                    <td class="text-bold">{{ t('remaining') }}</td>
                    <td class="text-bold">{{ formatPrice(remainingToPay) }}</td>
                </tr>
                <tr v-if="!isQuoteType && !isCompanyType(clientType) && nbMensualites && remainingToPay">
                    <td class="text-bold">{{ t('installments') }} ({{ nbMensualites }} {{
                        t('months') }})</td>
                    <td class="text-bold">{{ formatPrice(monthlyPayment) }}</td>
                </tr>

                <!-- Currency row -->
                <tr>
                    <td class="text-bold">{{ t('currency') }}</td>
                    <td class="text-bold">{{ currency }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { formatPrice as formatDocumentPrice } from '@/utils/documents.js'
import { useLang } from '@/composables/useLang.js'
import { computed } from 'vue'
import { isCompanyType } from '@/utils/clientTypes.js'

const props = defineProps({
    clientType: String, totalHT: Number, totalTVA: Number, totalTTC: Number, finalTotal: Number,
    isQuoteType: Boolean, deposit: Number, nbMensualites: Number, amountPaid: Number,
    remainingToPay: Number, monthlyPayment: Number, monthConcerned: String, currency: String
})

const lang = useLang()
const { getTranslation: t } = lang

// Flag if VAT is present
const hasTVA = computed(() => props.totalTVA > 0)

// Shows remaining due only if partially paid and different from total (tolerance 0.01€)
const shouldShowRemaining = computed(() => {
    if (!props.remainingToPay) return false
    const totalRef = hasTVA.value ? props.finalTotal : props.totalHT
    return props.amountPaid > 0 && Math.abs(props.remainingToPay - totalRef) >= 0.01
})

// Formats amounts according to locale
const formatPrice = v => formatDocumentPrice(v, lang.current.value)

// Formats month string localized
const formatMonth = d => d
    ? new Date(d).toLocaleDateString(lang.current.value === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' }).replace(/^./, s => s.toUpperCase())
    : ''
</script>
