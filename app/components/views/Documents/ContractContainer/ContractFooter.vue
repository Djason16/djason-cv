<template>
    <!-- Bottom bar of the contract, like the one of the opening of the site: the mint dot, the provider, the contact -->
    <div class="footer">
        <span><span class="footer__dot"></span>{{ t('soleProprietorship') }} – SIRET {{ providerInfo.siret }}<template v-if="!hasTVA">{{ ' · ' + t('tvaNotApplicable') }}</template></span>
        <span>{{ providerInfo.email }}<template v-if="providerInfo.phone">{{ ' · ' + providerInfo.phone }}</template></span>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

defineProps({
    providerInfo: Object,
    hasTVA: Boolean
})
</script>

<style scoped>
.footer {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-top: 22px;
    color: #a4b0b8;
    font-family: var(--font-label);
    font-size: 9.5px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
}

.footer__dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border-radius: 50%;
    background: #7ee6a8;
    vertical-align: 1px;
}
</style>
