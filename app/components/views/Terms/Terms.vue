<template>
    <!-- Content of the terms and conditions page (texts: plugins/translations/pages/terms.js) -->
    <OtherSectionLayout pageTitleKey="termsTitle" pageSubtitleKey="termsIntro" :sections="termsSections" titleTag="h2"
        titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="providerInfo" />
</template>

<script setup>
import { useSite } from '@/composables/useSite.js'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'

const site = useSite()

// Builds provider info dynamically
const providerInfo = {
    name: site.name,
    email: site.email,
    phone: site.phone
}

// Generates terms sections dynamically
const termsSections = Array.from({ length: 14 }, (_, i) => ({
    titleKey: `termsSection${i + 1}Title`,
    contentKey: `termsSection${i + 1}Content`
}))
</script>
