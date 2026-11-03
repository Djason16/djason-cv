<!-- Content of the privacy policy page (texts: plugins/translations/pages/privacy.js) -->
<template>
    <OtherSectionLayout pageTitleKey="privacyTitle" pageSubtitleKey="privacyIntro" :sections="privacySections" :dynamicData="{
            name: site.name,
            email: site.email,
            phone: site.phone,
            siret: site.siret,
            address: site.address
        }" />
</template>

<script setup>
import { useSite } from '@/composables/useSite.js'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'

const site = useSite()

// Privacy sections dynamically generated
const privacySections = Array.from({ length: 10 }, (_, i) => ({
    titleKey: `privacySection${i + 1}Title`,
    contentKey: `privacySection${i + 1}Content`
}))
</script>
