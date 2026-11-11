<!-- Content of the legal notice page (texts: plugins/translations/pages/legal.js) -->
<template>
    <OtherSectionLayout pageTitleKey="legalTitle" pageSubtitleKey="legalIntro" :sections="legalSections" :dynamicData="providerInfo" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSite } from '@/composables/useSite'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'

const site = useSite()

// Owner of the site (admin > Settings)
const providerInfo = computed(() => ({
    name: site.name,
    email: site.email,
    phone: site.phone,
    siret: site.siret,
    address: site.address,
    privacyPolicyUrl: '/privacy'
}))

// Generates legal sections dynamically
const legalSections = Array.from({ length: 8 }, (_, i) => ({
    titleKey: `legalSection${i + 1}Title`,
    contentKey: `legalSection${i + 1}Content`
}))
</script>
