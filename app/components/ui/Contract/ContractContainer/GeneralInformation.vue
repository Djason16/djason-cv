<template>
    <!-- Section: general info for provider and client -->
    <section class="section">
        <h3 class="section-title text-large text-bold">1. {{ $lang.getTranslation('generalInformation') }}</h3>

        <!-- Provider info block -->
        <div class="info-block">
            <p class="info-label text-normal">{{ $lang.getTranslation('provider') }}:</p>
            <div class="info-content text-small">
                {{ providerInfo.name }}<br />
                {{ providerInfo.invoiceAddress }}<br />
                SIRET: {{ providerInfo.siret }}<br />
                {{ hasTVA ? `${$lang.getTranslation('tva')}: ${providerInfo.tvaNumber}` :
                $lang.getTranslation('tvaNotApplicable') }}<br />
                {{ $lang.getTranslation('phone') }}: {{ providerInfo.phone }}<br />
                Email: {{ providerInfo.email }}<br />
                {{ $lang.getTranslation('website') }}: <a :href="websiteUrl">{{ websiteUrl }}</a>
            </div>
        </div>

        <!-- Client info block -->
        <div class="info-block">
            <p class="info-label text-normal">{{ $lang.getTranslation('client') }}:</p>
            <div class="info-content text-small">
                {{ client.name }}<br />
                {{ formatFullAddress(client) }}<br />
                <span v-if="client.siret">SIRET: {{ client.siret }}<br /></span>
                {{ $lang.getTranslation('phone') }}: {{ client.phone }}<br />
                Email: {{ client.email }}<br />
                {{ $lang.getTranslation('type') }}: {{ getClientTypeLabel(client.type) }}
            </div>
        </div>
    </section>
</template>

<script setup>
// Props: provider/client info, VAT presence, formatting functions, website
const props = defineProps({
    providerInfo: Object,
    client: Object,
    hasTVA: Boolean,
    formatFullAddress: Function,
    getClientTypeLabel: Function,
    websiteUrl: String
})

// Access global translation plugin
const { $lang } = useNuxtApp()
</script>

<style scoped>
.section {
    margin-bottom: 25px
}

.section-title {
    color: var(--third-color);
    margin-bottom: 12px;
    border-bottom: 2px solid var(--second-color);
    padding-bottom: 6px
}

.info-block {
    margin-bottom: 16px
}

.info-label {
    font-weight: 700;
    margin-bottom: 6px
}

.info-content {
    margin-left: 20px;
    line-height: 1.8
}

a {
    color: var(--accent-blue);
    text-decoration: none
}

a:hover {
    text-decoration: underline
}
</style>