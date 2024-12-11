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
const refundPolicySections = [
    { titleKey: 'refundPolicySection1Title', contentKey: 'refundPolicySection1Content' }, // Section 1: Refund eligibility
    { titleKey: 'refundPolicySection2Title', contentKey: 'refundPolicySection2Content' }, // Section 2: Request process
    { titleKey: 'refundPolicySection3Title', contentKey: 'refundPolicySection3Content' }, // Section 3: Non-refundable services
    { titleKey: 'refundPolicySection4Title', contentKey: 'refundPolicySection4Content' }, // Section 4: Approval process
    { titleKey: 'refundPolicySection5Title', contentKey: 'refundPolicySection5Content' }, // Section 5: Exceptions
];

// Set dynamic metadata for SEO purposes
const pageKey = 'refundPolicy';
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang));
});
</script>

<style></style>
