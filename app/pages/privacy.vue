<template>
    <!-- Use OtherSectionLayout to display the privacy policy content -->
    <OtherSectionLayout pageTitleKey="privacyTitle" pageSubtitleKey="privacyIntro" :sections="privacySections"
        titleTag="h2" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)"
        :dynamicData="{ name: personalInfo.name, email: personalInfo.email, phone: personalInfo.phone }" />
</template>

<script setup>
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'; // Reusable layout component
import { personalInfo } from "../utils/personalInfo.js"; // Personal data (e.g., name, email)
import { seoMetaData } from "../utils/seo.js"; // SEO configuration utility

// Current language context
const { $lang } = useNuxtApp();

// Define sections for the privacy policy
const privacySections = [
    { titleKey: 'privacySection1Title', contentKey: 'privacySection1Content' }, // Section 1: Data collected
    { titleKey: 'privacySection2Title', contentKey: 'privacySection2Content' }, // Section 2: Purpose of data collection
    { titleKey: 'privacySection3Title', contentKey: 'privacySection3Content' }, // Section 3: Data security
    { titleKey: 'privacySection4Title', contentKey: 'privacySection4Content' }, // Section 4: Sharing of data
    { titleKey: 'privacySection5Title', contentKey: 'privacySection5Content' }, // Section 5: User rights
    { titleKey: 'privacySection6Title', contentKey: 'privacySection6Content' }, // Section 6: Cookies policy
    { titleKey: 'privacySection7Title', contentKey: 'privacySection7Content' }, // Section 7: Data retention policy
    { titleKey: 'privacySection8Title', contentKey: 'privacySection8Content' }, // Section 8: Contact for privacy concerns
];

// Set dynamic metadata for SEO purposes
const pageKey = 'privacy';
useSeoMeta(seoMetaData(pageKey, $lang));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang));
});
</script>

<style></style>