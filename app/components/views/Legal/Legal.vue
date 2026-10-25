<template>
    <!-- Content of the legal notice page (texts: plugins/translations/pages/legal.js) -->
    <OtherSectionLayout pageTitleKey="legalTitle" pageSubtitleKey="legalIntro" :sections="legalSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="providerInfo" />
</template>

<script setup>
import { useSite } from '@/composables/useSite.js'
import { useRuntimeConfig } from '#app'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'

const config = useRuntimeConfig()
const site = useSite()

// Builds provider info dynamically
const providerInfo = {
    name: site.name,
    email: site.email,
    phone: site.phone,
    siret: config.public.legalSiret,
    address: config.public.legalAddress,
    privacyPolicyUrl: '/privacy'
}

// Generates legal sections dynamically
const legalSections = Array.from({ length: 8 }, (_, i) => ({
    titleKey: `legalSection${i + 1}Title`,
    contentKey: `legalSection${i + 1}Content`
}))
</script>
