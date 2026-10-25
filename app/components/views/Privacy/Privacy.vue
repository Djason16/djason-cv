<template>
    <!-- Content of the privacy policy page (texts: plugins/translations/pages/privacy.js) -->
    <OtherSectionLayout pageTitleKey="privacyTitle" pageSubtitleKey="privacyIntro" :sections="privacySections"
        titleTag="h2" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)" :dynamicData="{
            name: site.name,
            email: site.email,
            phone: site.phone,
            siret: config.public.legalSiret,
            address: config.public.legalAddress
        }" />
</template>

<script setup>
import { useSite } from '@/composables/useSite.js'
import { useRuntimeConfig } from '#app'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'

const config = useRuntimeConfig()
const site = useSite()

// Privacy sections dynamically generated
const privacySections = Array.from({ length: 10 }, (_, i) => ({
    titleKey: `privacySection${i + 1}Title`,
    contentKey: `privacySection${i + 1}Content`
}))
</script>
