<template>
    <!-- Document metadata: description, type, operation, optional order reference -->
    <div class="object-line text-small">
        <div v-if="description"><strong>{{ $lang.getTranslation('object') }}:</strong> {{ description }}</div>
        <div><strong>{{ $lang.getTranslation('type') }}:</strong> {{ translatedDocumentType }}</div>
        <div><strong>{{ $lang.getTranslation('operation') }}:</strong> {{ operationNature }}</div>
        <div v-if="orderRef"><strong>{{ $lang.getTranslation('orderRef') }}:</strong> {{ orderRef }}</div>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app';
const props = defineProps({
    description: String,
    translatedDocumentType: String,
    operationNature: String,
    orderRef: String
})

const { $lang } = useNuxtApp() // Translation utility
</script>

<style scoped>
.object-line {
    color: var(--text-color-dark);
    margin-bottom: 30px;
}
</style>