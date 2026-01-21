<template>
    <!-- Display legal notice: standard or quote-specific -->
    <div class="legal-text text-small" v-if="showLegalText && !isQuoteType">{{ legalText }}</div>
    <div class="legal-text text-small" v-else-if="isQuoteType">{{ quoteLegalText }}</div>
</template>

<script setup>
const props = defineProps({
    showLegalText: Boolean,
    isQuoteType: Boolean,
    legalText: String,
    quoteLegalText: String
})
</script>

<style scoped>
.legal-text {
    line-height: 1.6;
    text-align: justify;
    margin-bottom: 30px;
    color: var(--text-color-dark);
}
</style>