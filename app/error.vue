<template>
    <AppShell>
        <!-- Render 404 error page using reusable layout with dynamic content -->
        <OtherSectionLayout pageTitleKey="notFoundTitle" pageSubtitleKey="notFoundSubtitle" :sections="notFoundSections"
            titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)"
            contentClass="text-normal" contentColor="var(--text-color-light)" :dynamicData="providerInfo">
            <template #custom-content>
                <SlideInFromRight>
                    <div class="error-actions">
                        <HeroButton :label="$lang.getTranslation('backHome')" iconClass="fas fa-home"
                            :ariaLabel="$lang.getTranslation('backHome')" :title="$lang.getTranslation('backHome')"
                            @click="clearError({ redirect: '/' })" />
                    </div>
                </SlideInFromRight>
            </template>
        </OtherSectionLayout>
    </AppShell>
</template>

<script setup>
import { clearError, useNuxtApp, useRuntimeConfig } from '#app'
import { watch } from 'vue'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import AppShell from '~/components/layout/AppShell/AppShell.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { seoMetaData } from '~/utils/seo.js'

defineProps({ error: Object })

// Runtime config
const config = useRuntimeConfig()

// Language context
const { $lang } = useNuxtApp()

// Build provider info dynamically
const providerInfo = {
    name: config.public.name,
    email: config.public.contactEmail,
    phone: config.public.contactPhone
}

// Generate error page sections dynamically
const notFoundSections = Array.from({ length: 4 }, (_, i) => ({
    titleKey: `notFoundSection${i + 1}Title`,
    contentKey: `notFoundSection${i + 1}Content`
}))

// Setup SEO and refresh on language changes
const pageKey = 'notFound'
useSeoMeta(seoMetaData(pageKey, $lang, providerInfo))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang, providerInfo)))
</script>

<style scoped>
.error-actions {
    margin-top: 2rem;
}
</style>