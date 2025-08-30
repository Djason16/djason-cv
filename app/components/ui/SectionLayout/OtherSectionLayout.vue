<template>
    <div class="content-container">
        <!-- Header with dynamic title and subtitle -->
        <div class="header">
            <h1 :class="headerClass">{{ $lang.getTranslation(pageTitleKey, dynamicData) }}</h1>
            <p :class="subtitleClass">{{ $lang.getTranslation(pageSubtitleKey, dynamicData) }}</p>
        </div>

        <!-- Render sections list via CustomList component -->
        <CustomList :items="sections" :titleTag="titleTag" :titleClass="titleClass" :titleColor="titleColor"
            :contentClass="contentClass" :contentColor="contentColor" :dynamicData="dynamicData" />

        <!-- Optional custom content slot -->
        <slot name="custom-content"></slot>
    </div>

    <!-- Footer with background color based on content -->
    <FooterTop :color="contentBackgroundColor" />
</template>

<script setup>
import FooterTop from "~/components/layout/Footer/sections/FooterTop.vue"
import CustomList from "../List/CustomList.vue"

// Component props: customizable content, sections, and styles
defineProps({
    pageTitleKey: { type: String, required: true },
    pageSubtitleKey: { type: String, required: true },
    sections: { type: Array, required: true },
    headerClass: { type: String, default: "text-xxlarge text-uppercase text-bold" },
    subtitleClass: { type: String, default: "text-normal subtitle" },
    titleTag: { type: String, default: "h2" },
    titleClass: { type: String, default: "text-xlarge text-bold" },
    titleColor: { type: String, default: "var(--text-color-light)" },
    contentClass: { type: String, default: "text-normal" },
    contentColor: { type: String, default: "var(--text-color-light)" },
    dynamicData: { type: Object, default: () => ({}) },
})

// Footer color fixed to third theme color
const contentBackgroundColor = "var(--third-color)"
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