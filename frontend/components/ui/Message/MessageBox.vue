<template>
    <!-- Success or error message of a form, nothing when there is no message -->
    <div v-if="message" class="message-box text-body-s">
        <p :class="message.type" :style="{ margin: margin }">{{ t(message.key) }}</p>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()

defineProps({
    // translatedMessage of useMessage(): { type: 'success' | 'error', key }
    message: { type: Object as PropType<Record<string, any> | null>, default: null },
    margin: { type: String, default: '1.5rem 0 0' }
})
</script>
