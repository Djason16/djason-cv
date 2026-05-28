<!-- ContentContainer.vue -->
<template>
    <div class="content-container">
        <!-- Header with dynamic title and subtitle processed for links -->
        <div class="header">
            <h1 :class="headerClass">
                <span v-html="processText($lang.getTranslation(pageTitleKey, dynamicData), dynamicData)"></span>
            </h1>
            <p :class="subtitleClass">
                <span v-html="processText($lang.getTranslation(pageSubtitleKey, dynamicData), dynamicData)"></span>
            </p>
        </div>

        <!-- Render custom list with styling and dynamic content -->
        <CustomList :items="sections" :titleTag="titleTag" :titleClass="titleClass" :titleColor="titleColor"
            :contentClass="contentClass" :contentColor="contentColor" :dynamicData="dynamicData" />

        <!-- Slot for optional custom content -->
        <slot name="custom-content" />
    </div>

    <!-- Footer section with fixed theme color -->
    <FooterTop :color="contentBackgroundColor" />
</template>

<script setup>
import FooterTop from "~/components/layout/Footer/sections/FooterTop.vue"
import { useTextEscape } from '~/composables/useTextEscape'
import CustomList from "../List/CustomList.vue"

const { processText } = useTextEscape()

// Props for dynamic content, styling, and list configuration
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

// Fixed theme color for footer section
const contentBackgroundColor = "var(--third-color)"
</script>

<style scoped>
.content-container {
    padding: 4rem 2.5rem 3rem;
    background: var(--third-color);
    color: var(--text-color-light);
    line-height: 1.8;
}

.header {
    margin-bottom: 3rem;
    text-align: left;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.subtitle {
    margin-top: 0.8rem;
    color: var(--text-color-light);
    opacity: 0.75;
}
</style>