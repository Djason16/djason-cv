<template>
    <!-- Signatures of the contract, like the "approval" of a quote: the place and date, then one box per party (name, then room to sign) -->
    <section class="section">
        <h3 class="section-title text-large text-bold">15. {{ t('signatures') }}</h3>
        <p class="signature-date">{{ t('doneAt', { city: providerCity, date: formatDate(contractDate) }) }}</p>
        <!-- What the signature means: the terms read and accepted; a consumer: the start asked before the 14 days end -->
        <p class="signature-note">{{ t('contractCgvAccepted', { url: termsUrl }) }}</p>
        <p v-if="!isProfessional" class="signature-note"><span class="doc-tick" aria-hidden="true"></span>{{ t('contractEarlyStart') }}</p>

        <div class="signature-block">
            <div v-for="party in parties" :key="party.label" class="signature-item">
                <p class="signature-label">{{ party.label }}</p>
                <p class="signature-name">{{ party.name }}</p>
                <div class="signature-box" :aria-label="t('signature')"></div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { useLang } from '@/composables/useLang.js'
import { isProfessionalType } from '@/utils/clientTypes.js'

const { getTranslation: t } = useLang()

const props = defineProps({
    client: Object,
    providerInfo: Object,
    hasTVA: Boolean,
    contractDate: String,
    providerCity: String,
    formatDate: Function,
    websiteUrl: String,
})

const isProfessional = computed(() => isProfessionalType(props.client?.type))
const termsUrl = computed(() => `${String(props.websiteUrl || 'djason-chery.dev').replace(/^https?:\/\//, '').replace(/\/$/, '')}/terms`)

const parties = computed(() => [
    { label: t('provider'), name: props.providerInfo?.name ? `${props.providerInfo.name} EI` : '' },
    { label: t('client'), name: props.client?.name || '' },
])
</script>

<style scoped>
.signature-note {
    margin: 0 0 8px;
    color: #a4b0b8;
}

.signature-date {
    margin: 0 0 14px;
    color: #a4b0b8;
}

/* One box per party, side by side */
.signature-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
}

.signature-label {
    margin: 0 0 4px;
    color: #a4b0b8;
    font-family: var(--font-label);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
}

.signature-name {
    margin: 0;
    font-family: var(--font-display);
    font-size: 13px;
    font-stretch: 125%;
    font-weight: 600;
    text-transform: uppercase;
}

.signature-box {
    height: 80px;
    margin-top: 8px;
    background: #1b1d21;
}
</style>
