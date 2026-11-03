<template>
    <!-- General information article of the contract: provider and client in two cards side by side,
         the same information on the same line (like the quotes and invoices) -->
    <section class="section">
        <h3 class="section-title text-large text-bold">1. {{ t('generalInformation') }}</h3>

        <div class="info-parties">
            <p class="info-label">{{ t('provider') }}</p>
            <p class="info-label">{{ t('client') }}</p>
            <template v-for="row in rows" :key="row.key">
                <p :class="`is-${row.key}`" :style="row.key === 'name' ? { fontSize: partyNameSize(row.from) } : null">{{ row.from }}</p>
                <p :class="`is-${row.key}`" :style="row.key === 'name' ? { fontSize: partyNameSize(row.to) } : null">{{ row.to }}</p>
            </template>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLang } from '@/composables/useLang.js'
import { alignRows, partyNameSize } from '@/utils/display.js'

const { getTranslation: t } = useLang()
const props = defineProps({
    providerInfo: Object,
    client: Object,
    hasTVA: Boolean,
    formatFullAddress: Function,
    getClientTypeLabel: Function,
    websiteUrl: String
})

// Both parties line by line (utils/display.js alignRows): what both have face to face, the rest under it
const rows = computed(() => {
    const p = props.providerInfo || {}, c = props.client || {}
    const rows = [
        // The same lines as the quotes and invoices (BillingDocument)
        // "EI" after the name of a sole proprietor: required on every professional document
        { key: 'name', from: p.name ? `${p.name} EI` : '', to: c.name },
        { key: 'address', from: p.invoiceAddress, to: props.formatFullAddress(c) },
        { key: 'siret', from: p.siret && `SIRET ${p.siret}`, to: c.siret && `SIRET ${c.siret}` },
        { key: 'vat', from: props.hasTVA && p.tvaNumber ? `${t('tva')} ${p.tvaNumber}` : '', to: '' },
        { key: 'email', from: p.email, to: c.email },
        { key: 'phone', from: p.phone, to: c.phone },
        // The person to contact at the client, last: nothing faces it on the side of the provider
        { key: 'contact', from: '', to: c.contact },
    ]
    return [rows[0], ...alignRows(rows.slice(1))]
})
</script>

<style scoped>
/* Provider and client: two cards side by side, each drawn in one piece (no seam), the same information on the same line */
.info-parties {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 12px;
    padding: 14px 0;
    isolation: isolate;
}

.info-parties::before,
.info-parties::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: -1;
    width: calc(50% - 6px);
    background: #1b1d21;
}

.info-parties::before {
    left: 0;
}

.info-parties::after {
    right: 0;
}

.info-parties > * {
    margin: 0 !important;
    padding: 0 16px;
    color: #a4b0b8;
}

.info-parties .info-label {
    margin-bottom: 6px !important;
    color: #7ee6a8;
}

.info-parties .is-name {
    padding-bottom: 3px;
    color: #eef1f3;
    font-family: var(--font-display);
    font-size: 13px;
    font-stretch: 125%;
    font-weight: 600;
    text-transform: uppercase;
}
</style>
