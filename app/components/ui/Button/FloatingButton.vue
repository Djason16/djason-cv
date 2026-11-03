<template>
    <!-- Floating button of the bottom right corner (back to top, languages): fades in and out -->
    <Transition name="floating-btn">
        <button v-if="show" class="floating-btn text-small" v-bind="$attrs" :aria-label="ariaLabel" :title="ariaLabel"
            type="button" @click="$emit('click')">
            <slot />
        </button>
    </Transition>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
    show: { type: Boolean, default: true },
    ariaLabel: { type: String, default: '' }
})

defineEmits(['click'])
</script>
