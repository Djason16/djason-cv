<template>
    <!-- General information article of the contract: provider and client -->
    <section class="section">
        <h3 class="section-title text-large text-bold">1. {{ t('generalInformation') }}</h3>

        <!-- Provider info block -->
        <div class="info-block">
            <p class="info-label text-normal">{{ t('provider') }}:</p>
            <div class="info-content text-small">
                {{ providerInfo.name }}<br />
                {{ providerInfo.invoiceAddress }}<br />
                SIRET: {{ providerInfo.siret }}<br />
                {{ hasTVA ? `${t('tva')}: ${providerInfo.tvaNumber}` :
                t('tvaNotApplicable') }}<br />
                {{ t('phone') }}: {{ providerInfo.phone }}<br />
                Email: {{ providerInfo.email }}<br />
                {{ t('website') }}: <a :href="websiteUrl">{{ websiteUrl }}</a>
            </div>
        </div>

        <!-- Client info block -->
        <div class="info-block">
            <p class="info-label text-normal">{{ t('client') }}:</p>
            <div class="info-content text-small">
                {{ client.name }}<br />
                {{ formatFullAddress(client) }}<br />
                <span v-if="client.siret">SIRET: {{ client.siret }}<br /></span>
                {{ t('phone') }}: {{ client.phone }}<br />
                Email: {{ client.email }}<br />
                {{ t('type') }}: {{ getClientTypeLabel(client.type) }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
defineProps({
    providerInfo: Object,
    client: Object,
    hasTVA: Boolean,
    formatFullAddress: Function,
    getClientTypeLabel: Function,
    websiteUrl: String
})

// Access global translation plugin
</script>

<style scoped>
/* One block per party: label, then its details */
.info-block {
    margin-bottom: 16px
}
</style>
