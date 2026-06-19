<template>
    <!-- Items table: adapts columns based on pricing mode and TVA -->
    <table class="items-table text-small">
        <thead>
            <tr>
                <th>{{ isIndividualType(clientType) ? $lang.getTranslation('description') : $lang.getTranslation('date')
                }}</th>
                <th v-if="hasTjmItems">{{ $lang.getTranslation('hours') }}</th>
                <th v-if="hasTjmItems">{{ $lang.getTranslation('mission') }}</th>
                <th>{{ $lang.getTranslation('qty') }}</th>
                <th>{{ $lang.getTranslation('unitPriceHt') }}</th>
                <th v-if="hasTVA">{{ $lang.getTranslation('tva') }}</th>
                <th>{{ $lang.getTranslation('amountHt') }}</th>
                <th v-if="hasTVA">{{ $lang.getTranslation('amountTtc') }}</th>
            </tr>
        </thead>
        <tbody>
            <!-- Render each item row -->
            <tr v-for="(item, i) in items" :key="i">
                <td>{{ isIndividualType(clientType) ? item.name : formatDate(item.date) }}</td>
                <td v-if="hasTjmItems">{{ item.hours != null ? item.hours : '-' }}</td>
                <td v-if="hasTjmItems">{{ item.mission || '-' }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ formatPrice(item.unitPrice) }}</td>
                <td v-if="hasTVA">{{ item.tvaApplicable ? tvaRateLabel : $lang.getTranslation('no') }}</td>
                <td>{{ formatPrice(item.unitPrice * item.quantity) }}</td>
                <td v-if="hasTVA">{{ formatPrice(calculateItemTTC(item)) }}</td>
            </tr>
            <!-- Fallback row when no items exist -->
            <tr v-if="!items.length">
                <td :colspan="getColspan()" class="text-bold">{{ $lang.getTranslation('noItems') }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'
import { isIndividualType } from '~/utils/clientTypes'

const props = defineProps({
    items: Array,
    clientType: String,
    tvaRateLabel: String,
    hasTVA: Boolean,
    calculateItemTTC: Function
})

const { $lang } = useNuxtApp()

// True if at least one item was billed with TJM mode (tjm > 0 → hours is set)
const hasTjmItems = computed(() => props.items.some(i => i.hours != null && i.hours > 0))

// Format price by locale
const formatPrice = v => $lang.locale.value === 'fr'
    ? `${(v ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : `$${(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Format date by locale
const formatDate = d => d
    ? new Date(d).toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''

// Determine colspan dynamically based on TJM presence and TVA
const getColspan = () => {
    let base = 4 // date/description + qty + unitPrice + amountHt
    if (hasTjmItems.value) base += 2 // hours + mission
    if (props.hasTVA) base += 2 // tva + amountTtc
    return base
}
</script>

<style scoped>
.items-table {
    width: 100%;
    border-collapse: collapse;
    color: var(--text-color-dark);
    margin-bottom: 30px;
}

.items-table th {
    background: var(--third-color);
    color: var(--text-color-light);
    text-align: left;
    padding: 8px 12px;
    border: 1px solid var(--second-color);
}

.items-table td {
    padding: 8px 12px;
    border: 1px solid var(--second-color);
}
</style>