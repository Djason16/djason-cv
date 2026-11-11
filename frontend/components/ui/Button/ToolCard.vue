<template>
    <!-- Card of a tool of the admin, in the card grid of the site (card-grid.css): its code and icon at the top, its name and what it is for at the bottom; opens its modal -->
    <button type="button" class="grid-card tool-card" :title="title" :aria-label="ariaLabel" @click="emit('click', $event)">
        <transition name="fade" mode="out-in">
            <span v-if="!hideContent" class="tool-card__content">
                <span class="grid-card__top">
                    <span class="grid-card__code eyebrow">{{ code }}</span>
                    <i class="tool-card__icon" :class="icon" aria-hidden="true"></i>
                </span>
                <span class="tool-card__bottom">
                    <span class="grid-card__name text-display-xs">{{ text }}</span>
                    <span v-if="hint" class="tool-card__hint text-body-s">{{ hint }}</span>
                </span>
            </span>
        </transition>
    </button>
</template>

<script setup lang="ts">
defineProps({
    // Font Awesome classes of the icon
    icon: { type: String, required: true },
    // Small code at the top (AD-01...)
    code: { type: String, default: '' },
    title: { type: String, default: '' },
    ariaLabel: { type: String, default: '' },
    text: { type: String, default: '' },
    // One line under the name: what the tool is for
    hint: { type: String, default: '' },
    // true while its modal is open: the content fades out
    hideContent: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
</script>
