<template>
    <!-- Lines of the quote or invoice: columns depend on the pricing mode (TJM or flat rate) and the VAT -->
    <table class="items-table text-small">
        <thead>
            <tr>
                <!-- Date: always shown for all client types -->
                <th>{{ t('date') }}</th>
                <!-- Description: individual clients or pro clients with flat-rate pricing -->
                <th v-if="!hasTjmItems">{{ t('description') }}</th>
                <!-- Hours: only when TJM items exist -->
                <th v-if="hasTjmItems">{{ t('hours') }}</th>
                <!-- Mission: only when TJM items exist -->
                <th v-if="hasTjmItems">{{ t('mission') }}</th>
                <th>{{ t('qty') }}</th>
                <th>{{ t('unitPriceHt') }}</th>
                <th v-if="hasTVA">{{ t('tva') }}</th>
                <th>{{ t('amountHt') }}</th>
                <th v-if="hasTVA">{{ t('amountTtc') }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, i) in items" :key="i">
                <!-- Date cell: always shown for all client types -->
                <td>{{ formatDate(item.date) }}</td>
                <!-- Description cell: flat-rate pricing (no TJM) -->
                <td v-if="!hasTjmItems">{{ item.name || '-' }}</td>
                <!-- Hours cell: only when TJM items exist -->
                <td v-if="hasTjmItems">{{ item.hours != null ? item.hours : '-' }}</td>
                <!-- Mission cell: only when TJM items exist -->
                <td v-if="hasTjmItems">{{ item.mission || '-' }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatPrice(item.unitPrice) }}</td>
                <td v-if="hasTVA">{{ item.tvaApplicable ? tvaRateLabel : t('no') }}</td>
                <td>{{ formatPrice(item.unitPrice * item.quantity) }}</td>
                <td v-if="hasTVA">{{ formatPrice(calculateItemTTC(item)) }}</td>
            </tr>
            <tr v-if="!items.length">
                <td :colspan="getColspan()" class="text-bold">{{ t('noItems') }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { formatPrice as formatDocumentPrice } from '@/utils/documents.js'
import { useLang } from '@/composables/useLang.js'
import { computed } from 'vue'

const props = defineProps({
    items: Array,
    clientType: String,
    tvaRateLabel: String,
    hasTVA: Boolean,
    calculateItemTTC: Function
})

const lang = useLang()
const { getTranslation: t } = lang

// True only when at least one item is billed by TJM (has hours > 0)
const hasTjmItems = computed(() => props.items.some(i => i.hours != null && i.hours > 0))

// Price in the format of the document's language; dates are already formatted
const formatPrice = v => formatDocumentPrice(v, lang.current.value)

const formatDate = d => d
    ? new Date(d).toLocaleDateString(lang.current.value === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    : '-'

// Colspan for empty state row:
// TJM mode:        date + hours + mission + qty + unitPrice + amountHt = 6
// Flat-rate mode:  date + description + qty + unitPrice + amountHt     = 5
// +2 for TVA cols when applicable
const getColspan = () => {
    let base = hasTjmItems.value ? 6 : 5
    if (props.hasTVA) base += 2
    return base
}
</script>
