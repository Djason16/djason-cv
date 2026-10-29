<template>
    <!-- Terms and conditions article of the contract: links to the policies of the site -->
    <section class="section">
        <h3 class="section-title text-large text-bold">14. {{ t('tcIntegration') }}</h3>
        <p class="section-text text-small">{{ t('tcIntegrationIntro') }}</p>

        <ul class="bullet-list text-small">
            <li>{{ t('termsOfSale') }}</li>
            <li>{{ t('privacyPolicy') }}</li>
            <li>{{ t('contractRefundPolicy') }}</li>
        </ul>

        <p class="section-text text-small">
            {{ t('availableAt') }}: <a :href="websiteUrl">{{ websiteUrl }}</a>
        </p>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

defineProps({
    websiteUrl: String
})
</script>
