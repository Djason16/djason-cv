<template>
    <button v-if="show" class="floating-btn text-small" v-bind="$attrs" :aria-label="ariaLabel" :title="ariaLabel"
        type="button" @click="$emit('click')">
        <slot />
    </button>
</template>

<script setup>
// Props: visibility toggle and accessible label
defineProps({
    show: { type: Boolean, default: true },
    ariaLabel: { type: String, default: '' }
})

defineEmits(['click'])
</script>

<style scoped>
.floating-btn {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--third-color);
    color: var(--text-color-light);
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.floating-btn:hover {
    opacity: 1;
}

@media (max-width: 1024px) {
    .floating-btn {
        width: 2rem;
        height: 2rem;
        background-color: var(--fifth-color);
        opacity: 0.8;
    }

    .floating-btn:hover {
        opacity: 0.8;
    }
}

@media (max-width: 540px) {
    .floating-btn {
        width: 1.75rem;
        height: 1.75rem;
    }
}
</style>