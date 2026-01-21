<template>
    <!-- Render terms & conditions using reusable layout -->
    <OtherSectionLayout pageTitleKey="termsTitle" pageSubtitleKey="termsIntro" :sections="termsSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="{
            name: config.public.name,
            email: config.public.contactEmail,
            phone: config.public.contactPhone
        }" />
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#app'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { seoMetaData } from '~/utils/seo.js'

// Runtime config
const config = useRuntimeConfig()

// Language context
const { $lang } = useNuxtApp()
await $lang.loadGroup('legal')

// Generate sections dynamically
const termsSections = Array.from({ length: 14 }, (_, i) => ({
    titleKey: `termsSection${i + 1}Title`,
    contentKey: `termsSection${i + 1}Content`,
}))

// Setup SEO and refresh on language change
const pageKey = 'terms'
useSeoMeta(seoMetaData(pageKey, $lang, {
    name: config.public.name,
    email: config.public.contactEmail,
    phone: config.public.contactPhone
}))
watch(() => $lang.current.value, () =>
    useSeoMeta(seoMetaData(pageKey, $lang, {
        name: config.public.name,
        email: config.public.contactEmail,
        phone: config.public.contactPhone
    }))
)
</script>

<style></style>