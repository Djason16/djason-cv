<!-- Content of the refund policy page (texts: plugins/translations/pages/refundPolicy.js) -->
<template>
    <OtherSectionLayout pageTitleKey="refundPolicyTitle" pageSubtitleKey="refundPolicyIntro"
        :sections="refundPolicySections"
        :dynamicData="{
            name: site.name,
            email: site.email
        }" />
</template>

<script setup>
import { useSite } from '@/composables/useSite.js'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'

const site = useSite()

// Refund policy sections dynamically generated
const refundPolicySections = Array.from({ length: 7 }, (_, i) => ({
    titleKey: `refundPolicySection${i + 1}Title`,
    contentKey: `refundPolicySection${i + 1}Content`
}))
</script>
