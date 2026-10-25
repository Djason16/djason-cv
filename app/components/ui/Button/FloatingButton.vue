<template>
    <!-- Round floating button of the bottom right corner (back to top, languages) -->
    <button v-if="show" class="floating-btn text-small" v-bind="$attrs" :aria-label="ariaLabel" :title="ariaLabel"
        type="button" @click="$emit('click')">
        <slot />
    </button>
</template>

<script setup>
defineProps({
    show: { type: Boolean, default: true },
    ariaLabel: { type: String, default: '' }
})

defineEmits(['click'])
</script>
