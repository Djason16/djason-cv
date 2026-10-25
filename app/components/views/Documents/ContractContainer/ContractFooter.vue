<template>
    <!-- Footer of the contract pages: provider details and contact, VAT number when it applies -->
    <div class="footer text-small">
        <span v-if="!hasTVA">{{ t('tvaNotApplicable') }}<br /></span>
        {{ t('soleProprietorship') }} – SIRET {{ providerInfo.siret }}<br />
        {{ t('contact') }} : {{ providerInfo.email }} – {{ providerInfo.phone }}
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
;

defineProps({
    providerInfo: Object,
    hasTVA: Boolean
})
</script>

<style scoped>
.footer {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 2px solid var(--second-color);
    text-align: center;
    color: var(--text-color-dark);
}
</style>