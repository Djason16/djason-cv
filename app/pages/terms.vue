<template>
    <!-- Use OtherSectionLayout to display the terms and conditions -->
    <OtherSectionLayout pageTitleKey="termsTitle" pageSubtitleKey="termsIntro" :sections="termsSections" titleTag="h2"
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

// Define sections for terms and conditions
const termsSections = Array.from({ length: 9 }, (_, i) => ({
    titleKey: `termsSection${i + 1}Title`,
    contentKey: `termsSection${i + 1}Content`,
}));

// Set dynamic metadata for SEO purposes
const pageKey = 'terms';
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang));
});
</script>

<style></style>