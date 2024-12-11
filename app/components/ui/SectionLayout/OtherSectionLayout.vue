<template>
    <!-- Container for the content of the page -->
    <div class="content-container">
        <!-- Header section containing the title and subtitle -->
        <div class="header">
            <!-- Dynamically rendered page title using translation keys and dynamic data -->
            <h1 :class="headerClass">
                {{ $lang.getTranslation(pageTitleKey, dynamicData) }}
            </h1>

            <!-- Dynamically rendered page subtitle using translation keys and dynamic data -->
            <p :class="subtitleClass">
                {{ $lang.getTranslation(pageSubtitleKey, dynamicData) }}
            </p>
        </div>

        <!-- Render the list of sections dynamically based on the provided props -->
        <CustomList :items="sections" :titleTag="titleTag" :titleClass="titleClass" :titleColor="titleColor"
            :contentClass="contentClass" :contentColor="contentColor" :dynamicData="dynamicData" />

        <!-- Slot for injecting custom content if provided by the parent component -->
        <slot name="custom-content"></slot>
    </div>

    <!-- FooterTop component rendered with a dynamic background color -->
    <FooterTop :color="contentBackgroundColor" />
</template>

<script setup>
import FooterTop from "~/components/layout/Footer/sections/FooterTop.vue"; // Footer top component
import CustomList from '../List/CustomList.vue'; // Custom list component

// Define properties that the component expects to receive from the parent
defineProps({
    // Key for the page title (used for translation)
    pageTitleKey: { type: String, required: true },

    // Key for the page subtitle (used for translation)
    pageSubtitleKey: { type: String, required: true },

    // Array of sections to be rendered in the content
    sections: { type: Array, required: true },

    // Class for styling the header
    headerClass: { type: String, default: "text-xxlarge text-uppercase text-bold" },

    // Class for styling the subtitle
    subtitleClass: { type: String, default: "text-normal subtitle" },

    // Tag for the title (default is h2)
    titleTag: { type: String, default: "h2" },

    // Class for styling the section title
    titleClass: { type: String, default: "text-xlarge text-bold" },

    // Color for the section title
    titleColor: { type: String, default: "var(--text-color-light)" },

    // Class for styling the content inside the sections
    contentClass: { type: String, default: "text-normal" },

    // Color for the section content
    contentColor: { type: String, default: "var(--text-color-light)" },

    // Dynamic data passed to translation keys (for variables in the translations)
    dynamicData: { type: Object, default: () => ({}) },
});

// Set a static background color for the footer
const contentBackgroundColor = "var(--third-color)";
</script>

<style scoped>
.content-container {
    padding: 2.5rem;
    background: var(--third-color);
    color: var(--text-color-light);
    line-height: 1.8;
}

.header {
    margin-bottom: 2.5rem;
    text-align: left;
}

.subtitle {
    margin-top: 0.8rem;
    color: var(--text-color-light);
}
</style>