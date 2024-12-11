<template>
    <!-- Render either a link (<a>) or a button (<button>) based on whether 'href' is provided -->
    <component :is="href ? 'a' : 'button'" class="custom-button" :href="href" :target="href ? '_blank' : undefined"
        :rel="href ? 'noopener noreferrer' : undefined" :aria-label="ariaLabel || label">

        <!-- Icon section of the button/link -->
        <span class="custom-button__icon text-normal">
            <!-- The icon class is dynamically set based on 'iconClass' prop -->
            <i :class="iconClass"></i>
        </span>

        <!-- Text section of the button/link -->
        <span class="custom-button__text text-normal text-uppercase text-bold">{{ label }}</span>
    </component>
</template>

<script setup>
// Define component properties (props) and their default values
defineProps({
    // 'label' prop for the button/link text (default: "Button")
    label: {
        type: String,
        default: "Button",
    },
    // 'href' prop for the URL (optional, if provided, the component renders a link)
    href: {
        type: String,
        default: null,
    },
    // 'ariaLabel' prop for the accessibility label (optional)
    ariaLabel: {
        type: String,
        default: null,
    },
    // 'iconClass' prop to specify the icon (default: "fas fa-circle")
    iconClass: {
        type: String,
        default: "fas fa-circle",
    },
});
</script>

<style scoped>
.custom-button {
    display: inline-flex;
    align-items: center;
    gap: 1rem;
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