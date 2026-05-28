<template>
    <!-- Render terms & conditions using reusable layout with dynamic content -->
    <OtherSectionLayout pageTitleKey="termsTitle" pageSubtitleKey="termsIntro" :sections="termsSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="providerInfo" />
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#app'
import { watch } from 'vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { seoMetaData } from '~/utils/seo.js'

// Runtime config
const config = useRuntimeConfig()

// Language context
const { $lang } = useNuxtApp()
await $lang.loadGroup('legal')

// Build provider info dynamically
const providerInfo = {
    name: config.public.name,
    email: config.public.contactEmail,
    phone: config.public.contactPhone
}

// Generate terms sections dynamically
const termsSections = Array.from({ length: 14 }, (_, i) => ({
    titleKey: `termsSection${i + 1}Title`,
    contentKey: `termsSection${i + 1}Content`
}))

// Setup SEO and refresh on language changes
const pageKey = 'terms'
useSeoMeta(seoMetaData(pageKey, $lang, providerInfo))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang, providerInfo)))
</script>

<style></style>