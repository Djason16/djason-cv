<template>
    <!-- Custom list container with slide-in animation for each item -->
    <div class="custom-list">
        <!-- Loop through items and apply SlideInFromRight animation -->
        <SlideInFromRight v-for="(item, index) in items" :key="index">
            <div class="custom-list__item">
                <!-- Dynamic title rendered based on the provided tag (e.g., h3, h4) -->
                <component :is="titleTag" :class="['custom-list__title', titleClass]" :style="{ color: titleColor }">
                    {{ $lang.getTranslation(item.titleKey, dynamicData) }}
                </component>

                <!-- Content for each list item with dynamic styling and translations -->
                <p class="custom-list__content" :class="contentClass" :style="{ color: contentColor }">
                    {{ $lang.getTranslation(item.contentKey, dynamicData) }}
                </p>
            </div>
        </SlideInFromRight>
    </div>
</template>

<script setup>
import { useNuxtApp } from "#app"; // Import useNuxtApp for global app access
import SlideInFromRight from "~/components/animations/SlideInFromRight.vue"; // SlideInFromRight animation component

// Current language context
const { $lang } = useNuxtApp();

// Define props for the component, allowing dynamic customization of the list
defineProps({
    items: {
        type: Array, // Array of items to be displayed in the list
        required: true, // This prop is mandatory
        default: () => [], // Default value if no items are provided
    },
    titleTag: {
        type: String, // Title tag (e.g., h3, h4)
        default: "h3", // Default tag is h3
    },
    titleClass: {
        type: String, // CSS class for title styling
        default: "text-large text-bold", // Default class for styling the title
    },
    titleColor: {
        type: String, // Color of the title text
        default: "var(--third-color)", // Default color
    },
    contentClass: {
        type: String, // CSS class for content styling
        default: "text-normal", // Default class for styling the content
    },
    contentColor: {
        type: String, // Color of the content text
        default: "var(--text-color-grey)", // Default color for the content
    },
    dynamicData: {
        type: Object, // Object containing dynamic data used for translations
        default: () => ({}), // Default value is an empty object
    },
});
</script>

<style scoped>
.custom-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.custom-list__item {
    border-left: 4px solid var(--fourth-color);
    padding-left: 1rem;
}

.custom-list__title {
    margin: 0;
    font-weight: bold;
}

.custom-list__content {
    margin: 0.5rem 0;
    line-height: 1.6;
}
</style>
