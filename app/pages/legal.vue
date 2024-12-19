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
const legalSections = [
    { titleKey: 'legalSection1Title', contentKey: 'legalSection1Content' }, // Section 1: Publisher details
    { titleKey: 'legalSection2Title', contentKey: 'legalSection2Content' }, // Section 2: Hosting provider
    { titleKey: 'legalSection3Title', contentKey: 'legalSection3Content' }, // Section 3: Intellectual property rights
    { titleKey: 'legalSection4Title', contentKey: 'legalSection4Content' }, // Section 4: Liability disclaimer
    { titleKey: 'legalSection5Title', contentKey: 'legalSection5Content' }, // Section 5: Governing law
    { titleKey: 'legalSection6Title', contentKey: 'legalSection6Content' }, // Section 6: Privacy and cookies
    { titleKey: 'legalSection7Title', contentKey: 'legalSection7Content' }, // Section 7: Contact information
];

// Set dynamic metadata for SEO purposes
const pageKey = 'legal';
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));
});
</script>

<style></style>