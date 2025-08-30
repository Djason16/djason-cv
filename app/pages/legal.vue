<template>
    <!-- Render legal information using a reusable layout with dynamic content -->
    <OtherSectionLayout pageTitleKey="legalTitle" pageSubtitleKey="legalIntro" :sections="legalSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)"
        :dynamicData="{ name: personalInfo.name, email: personalInfo.email, phone: personalInfo.phone }" />
</template>

<script setup>
import { watch } from 'vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { personalInfo } from '~/utils/personalInfo.js'
import { seoMetaData } from '~/utils/seo.js'

const { $lang } = useNuxtApp()

// Generate legal sections dynamically
const legalSections = Array.from({ length: 7 }, (_, i) => ({
    titleKey: `legalSection${i + 1}Title`,
    contentKey: `legalSection${i + 1}Content`
}))

// Setup SEO and refresh on language changes
const pageKey = 'legal'
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang, personalInfo)))
</script>

<style></style>