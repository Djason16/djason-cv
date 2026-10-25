<template>
    <!-- Main button of the site: a link when href is given, otherwise a button -->
    <component :is="href ? 'a' : 'button'" class="custom-button" :class="`text-${size}`" :href="href || undefined"
        :aria-label="ariaLabel || label" :title="title || label" type="button">
        <!-- Icon display -->
        <span class="custom-button__icon" aria-hidden="true">
            <i :class="iconClass"></i>
        </span>

        <!-- Button/link text -->
        <span class="custom-button__text text-uppercase text-bold">
            {{ label }}
        </span>
    </component>
</template>

<script setup>
defineProps({
    label: { type: String, default: 'Button' },
    // Given = a link (<a>), otherwise a <button>
    href: { type: String, default: null },
    ariaLabel: { type: String, default: null },
    title: { type: String, default: null },
    // Font Awesome classes of the icon
    iconClass: { type: String, default: 'fas fa-circle' },
    // 'normal' or 'small' text
    size: { type: String, default: 'normal' },
})
</script>
