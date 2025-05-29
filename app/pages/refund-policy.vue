<template>
    <!-- Use OtherSectionLayout to display the refund policy content -->
    <OtherSectionLayout pageTitleKey="refundPolicyTitle" pageSubtitleKey="refundPolicyIntro"
        :sections="refundPolicySections" titleTag="h2" titleClass="text-xlarge text-bold"
        titleColor="var(--text-color-light)" contentClass="text-normal" contentColor="var(--text-color-light)"
        :dynamicData="{ name: personalInfo.name, email: personalInfo.email }" />
</template>

<script setup>
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'; // Reusable layout component
import { personalInfo } from "../utils/personalInfo.js"; // Personal data (e.g., name, email)
import { seoMetaData } from "../utils/seo.js"; // SEO configuration utility

// Current language context
const { $lang } = useNuxtApp();

// Define sections for the refund policy
const refundPolicySections = Array.from({ length: 5 }, (_, i) => ({
    titleKey: `refundPolicySection${i + 1}Title`,
    contentKey: `refundPolicySection${i + 1}Content`,
}));

// Set dynamic metadata for SEO purposes
const pageKey = 'refundPolicy';
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang));
});
</script>

<style></style>
