<template>
    <!-- Render legal information using a reusable layout with dynamic content -->
    <OtherSectionLayout pageTitleKey="legalTitle" pageSubtitleKey="legalIntro" :sections="legalSections" titleTag="h2"
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
    phone: config.public.contactPhone,
    siret: config.public.legalSiret,
    address: config.public.legalAddress
}

// Generate legal sections dynamically
const legalSections = Array.from({ length: 8 }, (_, i) => ({
    titleKey: `legalSection${i + 1}Title`,
    contentKey: `legalSection${i + 1}Content`
}))

// Setup SEO and refresh on language changes
const pageKey = 'legal'
useSeoMeta(seoMetaData(pageKey, $lang, providerInfo))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang, providerInfo)))
</script>

<style></style>