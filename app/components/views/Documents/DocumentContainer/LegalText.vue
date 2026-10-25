<template>
    <!-- Legal notices of the quote or invoice: late payment text depends on the client type -->
    <div v-if="showLegalText" class="legal-text text-small">
        <p v-if="isQuoteType">{{ quoteLegalText }}</p>
        <p v-else>{{ latePaymentText }}</p>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed } from 'vue'
import { isProfessionalType } from '@/utils/clientTypes.js'

const lang = useLang()

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
        ? lang.getTranslation('latePaymentNoticePro')
        : lang.getTranslation('latePaymentNoticeIndividual')
)
</script>
