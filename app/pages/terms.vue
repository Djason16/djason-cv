<template>
    <!-- Use OtherSectionLayout to display the terms and conditions -->
    <OtherSectionLayout pageTitleKey="termsTitle" pageSubtitleKey="termsIntro" :sections="termsSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="{ name: personalInfo.name, email: personalInfo.email }" />
</template>

<script setup>
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'; // Reusable layout component
import { personalInfo } from "../utils/personalInfo.js"; // Personal data (e.g., name, email)
import { seoMetaData } from "../utils/seo.js"; // SEO configuration utility

// Current language context
const { $lang } = useNuxtApp();

// Define sections for terms and conditions
const termsSections = [
    { titleKey: 'termsSection1Title', contentKey: 'termsSection1Content' }, // Section 1: Ownership of content
    { titleKey: 'termsSection2Title', contentKey: 'termsSection2Content' }, // Section 2: Use of services
    { titleKey: 'termsSection3Title', contentKey: 'termsSection3Content' }, // Section 3: Payment terms
    { titleKey: 'termsSection4Title', contentKey: 'termsSection4Content' }, // Section 4: Service availability
    { titleKey: 'termsSection5Title', contentKey: 'termsSection5Content' }, // Section 5: External links
    { titleKey: 'termsSection6Title', contentKey: 'termsSection6Content' }, // Section 6: Privacy policy
    { titleKey: 'termsSection7Title', contentKey: 'termsSection7Content' }, // Section 7: Liability limitations
    { titleKey: 'termsSection8Title', contentKey: 'termsSection8Content' }, // Section 8: Changes to terms
    { titleKey: 'termsSection9Title', contentKey: 'termsSection9Content' }, // Section 9: Contact information
];

// Set dynamic metadata for SEO purposes
const pageKey = 'terms';
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang));
});
</script>

<style></style>