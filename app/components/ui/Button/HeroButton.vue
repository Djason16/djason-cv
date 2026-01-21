<template>
    <!-- Render an anchor if 'href' exists, else a button -->
    <component :is="href ? 'a' : 'button'" class="custom-button" :href="href" :target="href ? '_blank' : undefined"
        :rel="href ? 'noopener noreferrer' : undefined" :aria-label="ariaLabel || label" :title="title || label">
        <!-- Icon display -->
        <span class="custom-button__icon text-normal">
            <i :class="iconClass"></i>
        </span>
        <!-- Button/link text -->
        <span class="custom-button__text text-normal text-uppercase text-bold">{{ label }}</span>
    </component>
</template>

<script setup>
// Props: label, optional link, accessibility label, and icon class
defineProps({
    label: { type: String, default: 'Button' },          // Display text
    href: { type: String, default: null },               // Makes it a link if provided
    ariaLabel: { type: String, default: null },          // Accessibility label
    title: { type: String, default: null },              // Tooltip/title
    iconClass: { type: String, default: 'fas fa-circle' } // Icon for the button/link
})
</script>

<style scoped>
.custom-button::after,
.custom-button__icon::after,
.custom-button__text::after {
    display: none;
}

.custom-button {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
    width: fit-content;
    padding: 0.5rem 1.5rem;
    color: var(--text-color-light);
    background-color: transparent;
    border: 2px solid var(--text-color-light);
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    text-decoration: none;
    transition: all 0.3s ease;
    will-change: transform, opacity;
}

.custom-button:hover {
    background-color: var(--second-color);
    border-color: var(--third-color);
    color: var(--third-color);
}

.custom-button__text {
    z-index: 1;
}

.custom-button__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
    will-change: transform, color;
}

.custom-button:hover .custom-button__icon {
    transform: scale(1.35);
    color: var(--third-color);
}

@media (max-width: 1024px) {
    .custom-button:hover {
        background-color: transparent;
        border: 2px solid var(--text-color-light);
        color: var(--text-color-light);
    }

    .custom-button:hover .custom-button__icon {
        transform: scale(1);
        color: var(--text-color-light);
    }
}

@media (max-width: 768px) {
    .custom-button__text {
        display: none;
    }
}
</style>