<template>
    <!-- Use OtherSectionLayout to display the legal information -->
    <OtherSectionLayout pageTitleKey="legalTitle" pageSubtitleKey="legalIntro" :sections="legalSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)"
        :dynamicData="{ name: personalInfo.name, email: personalInfo.email, phone: personalInfo.phone }" />
</template>

<script setup>
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'; // Reusable layout component
import { personalInfo } from "../utils/personalInfo.js"; // Personal data (e.g., name, email)
import { seoMetaData } from "../utils/seo.js"; // SEO configuration utility

// Current language context
const { $lang } = useNuxtApp();

// Define sections for the legal information
const legalSections = Array.from({ length: 7 }, (_, i) => ({
    titleKey: `legalSection${i + 1}Title`,
    contentKey: `legalSection${i + 1}Content`,
}));

// Set dynamic metadata for SEO purposes
const pageKey = 'legal';
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));
});
</script>

<style></style>