<template>
    <!-- Display message if present -->
    <div v-if="message" class="message-box text-large">
        <p :class="message.type" :style="{ margin: margin }">{{ $lang.getTranslation(message.key) }}</p>
    </div>
</template>

<script setup>
const { $lang } = useNuxtApp()

// Props: optional message object with type (success/error) and translation key, plus optional margin value for the message
const props = defineProps({
    message: { type: Object, default: null },
    margin: { type: String, default: '3rem 0 0' }
})
</script>

<style scoped>
.message-box p {
    text-align: center;
    padding: 1rem;
    border-radius: 4px;
    max-width: 30rem;
}

/* Success message styling */
.message-box p.success {
    color: var(--accent-green);
    background-color: rgba(30, 255, 0, 0.1);
}

/* Error message styling */
.message-box p.error {
    color: var(--accent-red);
    background-color: rgba(255, 0, 0, 0.1);
}
</style>