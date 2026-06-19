<template>
    <!-- Items table: adapts columns based on pricing mode and TVA -->
    <table class="items-table text-small">
        <thead>
            <tr>
                <!-- Date: always shown for all client types -->
                <th>{{ $lang.getTranslation('date') }}</th>
                <!-- Description: individual clients or pro clients with flat-rate pricing -->
                <th v-if="!hasTjmItems">{{ $lang.getTranslation('description') }}</th>
                <!-- Hours: only when TJM items exist -->
                <th v-if="hasTjmItems">{{ $lang.getTranslation('hours') }}</th>
                <!-- Mission: only when TJM items exist -->
                <th v-if="hasTjmItems">{{ $lang.getTranslation('mission') }}</th>
                <th>{{ $lang.getTranslation('qty') }}</th>
                <th>{{ $lang.getTranslation('unitPriceHt') }}</th>
                <th v-if="hasTVA">{{ $lang.getTranslation('tva') }}</th>
                <th>{{ $lang.getTranslation('amountHt') }}</th>
                <th v-if="hasTVA">{{ $lang.getTranslation('amountTtc') }}</th>
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
                <td v-if="hasTVA">{{ item.tvaApplicable ? tvaRateLabel : $lang.getTranslation('no') }}</td>
                <td>{{ formatPrice(item.unitPrice * item.quantity) }}</td>
                <td v-if="hasTVA">{{ formatPrice(calculateItemTTC(item)) }}</td>
            </tr>
            <tr v-if="!items.length">
                <td :colspan="getColspan()" class="text-bold">{{ $lang.getTranslation('noItems') }}</td>
            </tr>
        </tbody>
    </table>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'

const props = defineProps({
    items: Array,
    clientType: String,
    tvaRateLabel: String,
    hasTVA: Boolean,
    calculateItemTTC: Function
})

const { $lang } = useNuxtApp()

// True only when at least one item is billed by TJM (has hours > 0)
const hasTjmItems = computed(() => props.items.some(i => i.hours != null && i.hours > 0))

const formatPrice = v => $lang.locale.value === 'fr'
    ? `${(v ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : `$${(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = d => d
    ? new Date(d).toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
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