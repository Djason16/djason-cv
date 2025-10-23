<template>
    <!-- Footer displaying provider info and contact, handles VAT display dynamically -->
    <div class="footer text-small">
        <span v-if="!hasTVA">{{ $lang.getTranslation('tvaNotApplicable') }}<br /></span>
        {{ $lang.getTranslation('soleProprietorship') }} – SIRET {{ providerInfo.siret }}<br />
        {{ $lang.getTranslation('contact') }} : {{ providerInfo.email }} – {{ providerInfo.phone }}
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app';
const { $lang } = useNuxtApp()

const props = defineProps({
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