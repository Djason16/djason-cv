<template>
    <!-- Render privacy policy via reusable layout -->
    <OtherSectionLayout pageTitleKey="privacyTitle" pageSubtitleKey="privacyIntro" :sections="privacySections"
        titleTag="h2" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="{
            name: config.public.name,
            email: config.public.contactEmail,
            phone: config.public.contactPhone,
            siret: config.public.legalSiret,
            address: config.public.legalAddress
        }" />
</template>

<script setup>
import { useNuxtApp, useRuntimeConfig } from '#app'
import { seoMetaData } from '@/utils/seo.js'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'

// Runtime config
const config = useRuntimeConfig()

// Language context
const { $lang } = useNuxtApp()
await $lang.loadGroup('legal')

// Privacy sections dynamically generated
const privacySections = Array.from({ length: 10 }, (_, i) => ({
    titleKey: `privacySection${i + 1}Title`,
    contentKey: `privacySection${i + 1}Content`
}))

// SEO setup for page and reactive update on language change
const pageKey = 'privacy'
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))
</script>

<style></style>