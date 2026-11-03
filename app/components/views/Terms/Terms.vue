<!-- Content of the terms and conditions page (texts: plugins/translations/pages/terms.js) -->
<template>
    <OtherSectionLayout pageTitleKey="termsTitle" pageSubtitleKey="termsIntro" :sections="termsSections" :dynamicData="providerInfo" />
</template>

<script setup>
import { computed } from 'vue'
import { useSite } from '@/composables/useSite.js'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'

const site = useSite()

// Owner of the site and consumer mediator (admin > My info), printed in the texts
const providerInfo = computed(() => ({
    name: site.name,
    email: site.email,
    phone: site.phone,
    mediatorName: site.mediatorName || '—',
    mediatorAddress: site.mediatorAddress || '—',
    mediatorUrl: site.mediatorUrl || '—',
}))

// Generates terms sections dynamically
const termsSections = Array.from({ length: 14 }, (_, i) => ({
    titleKey: `termsSection${i + 1}Title`,
    contentKey: `termsSection${i + 1}Content`
}))
</script>
