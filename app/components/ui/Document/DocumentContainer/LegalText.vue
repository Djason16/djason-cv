<template>
    <!-- Legal notices: late payment notice adapts based on client type (pro vs individual) -->
    <div v-if="showLegalText" class="legal-text text-small">
        <p v-if="isQuoteType">{{ quoteLegalText }}</p>
        <p v-else>{{ latePaymentText }}</p>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed } from 'vue'
import { isProfessionalType } from '~/utils/clientTypes'

const { $lang } = useNuxtApp()

const props = defineProps({
    showLegalText: Boolean,
    isQuoteType: Boolean,
    lateText: String,
    quoteLegalText: String,
    clientType: { type: String, default: 'individual' }
})

// Late payment notice differs: professionals get fixed €40 recovery fee, individuals do not
const latePaymentText = computed(() =>
    isProfessionalType(props.clientType)
        ? $lang.getTranslation('latePaymentNoticePro')
        : $lang.getTranslation('latePaymentNoticeIndividual')
)
</script>

<style scoped>
.legal-text {
    line-height: 1.6;
    text-align: justify;
    margin-bottom: 30px;
    color: var(--text-color-dark);
}
</style>