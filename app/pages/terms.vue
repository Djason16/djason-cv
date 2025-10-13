<template>
    <!-- Render terms & conditions using reusable layout -->
    <OtherSectionLayout pageTitleKey="termsTitle" pageSubtitleKey="termsIntro" :sections="termsSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)"
        :dynamicData="{ name: personalInfo.name, email: personalInfo.email, phone: personalInfo.phone }" />
</template>

<script setup>
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { personalInfo } from '~/utils/personalInfo.js'
import { seoMetaData } from '~/utils/seo.js'

// Language context
const { $lang } = useNuxtApp()

// Generate sections dynamically
const termsSections = Array.from({ length: 14 }, (_, i) => ({
    titleKey: `termsSection${i + 1}Title`,
    contentKey: `termsSection${i + 1}Content`,
}))

// Setup SEO and refresh on language change
const pageKey = 'terms'
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))
</script>

<style></style>