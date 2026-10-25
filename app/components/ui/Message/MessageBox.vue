<template>
    <!-- Success or error message of a form, nothing when there is no message -->
    <div v-if="message" class="message-box text-large">
        <p :class="message.type" :style="{ margin: margin }">{{ t(message.key) }}</p>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

defineProps({
    // translatedMessage of useMessage(): { type: 'success' | 'error', key }
    message: { type: Object, default: null },
    margin: { type: String, default: '3rem 0 0' }
})
</script>
