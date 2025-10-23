<template>
    <!-- Items table: adapts headers and columns based on client type and TVA -->
    <table class="items-table text-small">
        <thead>
            <tr>
                <th v-if="isIndividualType(clientType)">{{ $lang.getTranslation('description') }}</th>
                <th v-else>{{ $lang.getTranslation('date') }}</th>
                <th v-if="!isIndividualType(clientType)">{{ $lang.getTranslation('hours') }}</th>
                <th v-if="!isIndividualType(clientType)">{{ $lang.getTranslation('mission') }}</th>
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
                <td v-if="isIndividualType(clientType)">{{ item.name }}</td>
                <td v-else>{{ formatDate(item.date) }}</td>
                <td v-if="!isIndividualType(clientType)">{{ item.hours || '' }}</td>
                <td v-if="!isIndividualType(clientType)">{{ item.mission || '' }}</td>
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

const props = defineProps({
    items: Array,
    clientType: String,
    tvaRateLabel: String,
    hasTVA: Boolean,
    calculateItemTTC: Function
})

const { $lang } = useNuxtApp()

// Helpers for client type, formatting prices and dates
const isIndividualType = t => t === 'individual'
const formatPrice = v => $lang.locale.value === 'fr'
    ? `${(v ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : `$${(v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const formatDate = d => d
    ? new Date(d).toLocaleDateString($lang.locale.value === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' })
    : ''

// Determine colspan dynamically based on client type and TVA
const getColspan = () => {
    let base = 5
    if (['company', 'freelance'].includes(props.clientType)) base += 3
    if (props.hasTVA) base += 1
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