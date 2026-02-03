<template>
    <!-- Signatures section: provider and client with date and city -->
    <section class="section">
        <h3 class="section-title text-large text-bold">15. {{ $lang.getTranslation('signatures') }}</h3>
        <p class="signature-date text-small">
            {{ $lang.getTranslation('doneAt', { city: providerCity, date: formatDate(contractDate) }) }}
        </p>

        <div class="signature-block text-small">
            <!-- Provider signature -->
            <div class="signature-item">
                <p class="signature-label">{{ $lang.getTranslation('provider') }}</p>
                <p>{{ providerInfo.name }}</p>
                <p class="signature-line">{{ $lang.getTranslation('signature') }} : ______________________</p>
            </div>

            <!-- Client signature -->
            <div class="signature-item">
                <p class="signature-label">{{ $lang.getTranslation('client') }}</p>
                <p>{{ client.name }}</p>
                <p class="signature-line">{{ $lang.getTranslation('signature') }} : ______________________</p>
            </div>
        </div>
    </section>
</template>

<script setup>
import { useNuxtApp } from '#app';
const { $lang } = useNuxtApp()

const props = defineProps({
    client: Object,
    providerInfo: Object,
    hasTVA: Boolean,
    contractDate: String,
    providerCity: String,
    formatDate: Function
})
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

.signature-date {
    text-align: center;
    font-weight: 700;
    margin-bottom: 20px
}

.signature-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 40px
}

.signature-item {
    text-align: center
}

.signature-line {
    margin-top: 40px
}

.signature-label {
    font-weight: 700
}
</style>