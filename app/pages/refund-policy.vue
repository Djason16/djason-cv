<template>
    <!-- Render refund policy via reusable layout -->
    <OtherSectionLayout pageTitleKey="refundPolicyTitle" pageSubtitleKey="refundPolicyIntro"
        :sections="refundPolicySections" titleTag="h2" titleClass="text-xlarge text-bold"
        titleColor="var(--text-color-light)" contentClass="text-normal" contentColor="var(--text-color-light)"
        :dynamicData="{ name: personalInfo.name, email: personalInfo.email }" />
</template>

<script setup>
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { personalInfo } from '@/utils/personalInfo.js'
import { seoMetaData } from '@/utils/seo.js'

// Language context and SEO key
const { $lang } = useNuxtApp()
await $lang.loadGroup('legal')

// Refund policy sections dynamically generated
const refundPolicySections = Array.from({ length: 7 }, (_, i) => ({
    titleKey: `refundPolicySection${i + 1}Title`,
    contentKey: `refundPolicySection${i + 1}Content`
}))

// SEO setup for page and reactive update on language change
const pageKey = 'refundPolicy'
useSeoMeta(seoMetaData(pageKey, $lang, personalInfo))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))
</script>

<style></style>
