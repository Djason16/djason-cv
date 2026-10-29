<template>
    <!-- Availability badge of the moment (available, busy, unavailable), shown in the browser only -->
    <div v-if="isMounted" :class="['availability-button', `is-${status}`]"
        :aria-label="t(status)" :title="t(status)">
        <!-- Dot in the color of the status -->
        <span class="availability-button__dot" aria-hidden="true"></span>
        <span class="availability-button__text text-normal text-uppercase text-bold">
            {{ t(status) }}
        </span>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { onMounted, ref } from 'vue'

const { getTranslation: t } = useLang()

defineProps({
    status: { type: String, required: true, validator: v => ['available', 'busy', 'unavailable'].includes(v) }
})

// Rendered in the browser only: the status of the moment is not known while the server renders the page
const isMounted = ref(false)
onMounted(() => isMounted.value = true)
</script>

<style scoped>
/* Badge with a dot and the status */
.availability-button {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem 1.5rem;
    border: 2px solid transparent;
    border-radius: 4px;
    cursor: default;
    background-color: var(--fourth-color);
    color: var(--text-color-light);
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

.availability-button.is-available,
.availability-button.is-busy,
.availability-button.is-unavailable {
    border-color: var(--fourth-color);
    background-color: var(--fourth-color);
}

.availability-button__dot {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    background-color: var(--text-color-light);
    transition: transform 0.3s ease, background-color 0.3s ease;
    position: relative;
}

/* Pulsing halo around the dot */
.availability-button__dot::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: inherit;
    transform: scale(1);
    opacity: 0;
    transition: all 0.3s ease;
}

.availability-button:hover .availability-button__dot::before {
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 0.8;
    }

    50% {
        transform: scale(1.5);
        opacity: 0.4;
    }

    100% {
        transform: scale(2);
        opacity: 0;
    }
}

/* Color of each status */
.availability-button.is-available .availability-button__dot {
    background-color: var(--accent-green);
}

.availability-button.is-busy .availability-button__dot {
    background-color: var(--accent-yellow);
}

.availability-button.is-unavailable .availability-button__dot {
    background-color: var(--accent-red);
}

.availability-button:hover .availability-button__dot {
    transform: scale(1.2);
}
</style>