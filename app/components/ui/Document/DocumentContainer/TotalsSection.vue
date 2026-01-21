<template>
    <!-- Totals table for individuals, companies, quotes, and payments -->
    <div class="totals-section">
        <table class="totals-table text-small">
            <!-- Non-individual clients -->
            <tbody v-if="!isIndividualType(clientType)">
                <tr>
                    <td class="text-bold">{{ $lang.getTranslation('totalHt') }}</td>
                    <td class="text-bold">{{ formatPrice(totalHT) }}</td>
                </tr>
                <tr v-if="hasTVA">
                    <td class="text-bold">{{ $lang.getTranslation('totalTva') }}</td>
                    <td class="text-bold">{{ formatPrice(totalTVA) }}</td>
                </tr>
                <tr v-if="hasTVA">
                    <td class="text-bold">{{ $lang.getTranslation('totalTtc') }}</td>
                    <td class="text-bold">{{ formatPrice(totalTTC) }}</td>
                </tr>
                <tr v-if="!isQuoteType">
                    <td class="text-bold">{{ $lang.getTranslation('monthConcerned') }}</td>
                    <td class="text-bold">{{ formatMonth(monthConcerned) }}</td>
                </tr>
            </tbody>

            <!-- Individual clients -->
            <tbody v-else>
                <tr>
                    <td class="text-bold">{{ $lang.getTranslation('totalHt') }}</td>
                    <td class="text-bold">{{ formatPrice(totalHT) }}</td>
                </tr>
                <tr v-if="hasTVA">
                    <td class="text-bold">{{ $lang.getTranslation('totalTva') }}</td>
                    <td class="text-bold">{{ formatPrice(totalTVA) }}</td>
                </tr>
                <tr v-if="hasTVA">
                    <td class="text-bold">{{ $lang.getTranslation('totalTtc') }}</td>
                    <td class="text-bold">{{ formatPrice(finalTotal) }}</td>
                </tr>
                <tr v-if="!isQuoteType && (deposit || (nbMensualites && amountPaid))">
                    <td class="text-bold">{{ $lang.getTranslation('paid') }}</td>
                    <td class="text-bold">{{ formatPrice(amountPaid) }}</td>
                </tr>
                <tr v-if="!isQuoteType && shouldShowRemaining">
                    <td class="text-bold">{{ $lang.getTranslation('remaining') }}</td>
                    <td class="text-bold">{{ formatPrice(remainingToPay) }}</td>
                </tr>
                <tr v-if="!isQuoteType && nbMensualites && remainingToPay">
                    <td class="text-bold">{{ $lang.getTranslation('installments') }} ({{ nbMensualites }} {{
                        $lang.getTranslation('months') }})</td>
                    <td class="text-bold">{{ formatPrice(monthlyPayment) }}</td>
                </tr>
            </tbody>

            <!-- Currency row -->
            <tbody>
                <tr>
                    <td class="text-bold">{{ $lang.getTranslation('currency') }}</td>
                    <td class="text-bold">{{ currency }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'

const props = defineProps({
    clientType: String, totalHT: Number, totalTVA: Number, totalTTC: Number, finalTotal: Number,
    isQuoteType: Boolean, deposit: Number, nbMensualites: Number, amountPaid: Number,
    remainingToPay: Number, monthlyPayment: Number, monthConcerned: String, currency: String
})

const { $lang } = useNuxtApp()

// Determine if client is individual
const isIndividualType = t => t === 'individual'

// Flag if VAT is present
const hasTVA = computed(() => props.totalTVA > 0)

// Show remaining due only if partially paid and different from total (tolerance 0.01€)
const shouldShowRemaining = computed(() => {
    if (!props.remainingToPay) return false
    const totalRef = hasTVA.value ? props.finalTotal : props.totalHT
    return props.amountPaid > 0 && Math.abs(props.remainingToPay - totalRef) >= 0.01
})

// Format amounts according to locale
const formatPrice = v => $lang.locale.value === 'fr'
    ? `${(v ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : `$${(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Format month string localized
const formatMonth = d => d
    ? new Date(d).toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' }).replace(/^./, s => s.toUpperCase())
    : ''
</script>

<style scoped>
.totals-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 30px;
}

.totals-table {
    width: 380px;
    border-collapse: collapse;
}

.totals-table td {
    padding: 8px 12px;
    border: 1px solid var(--second-color);
    color: var(--text-color-dark);
}

.totals-table td:first-child {
    background: #f7f9fb;
    font-weight: 600;
}
</style>