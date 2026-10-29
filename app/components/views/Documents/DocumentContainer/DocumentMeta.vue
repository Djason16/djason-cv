<template>
    <!-- Object of the quote or invoice: description, type of operation, order reference when given -->
    <div class="object-line text-small">
        <div v-if="description"><strong>{{ t('object') }}:</strong> {{ description }}</div>
        <div><strong>{{ t('type') }}:</strong> {{ translatedDocumentType }}</div>
        <div><strong>{{ t('operation') }}:</strong> {{ operationNature }}</div>
        <div v-if="orderRef"><strong>{{ t('orderRef') }}:</strong> {{ orderRef }}</div>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
defineProps({
    description: String,
    translatedDocumentType: String,
    operationNature: String,
    orderRef: String
})
</script>
