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
;

defineProps({
    websiteUrl: String
})
</script>

<style scoped>
.section {
    margin-bottom: 25px
}

.section-title {
    color: var(--third-color);
    margin-bottom: 12px;
    border-bottom: 2px solid var(--second-color);
    padding-bottom: 6px
}

.section-text {
    text-align: justify;
    margin-bottom: 16px;
    line-height: 1.8
}

.bullet-list {
    list-style: none;
    padding-left: 20px;
    margin: 0 0 16px 0;
    line-height: 1.8
}

.bullet-list li {
    margin-bottom: 8px;
    text-align: justify;
    position: relative;
    padding-left: 20px;
}

.bullet-list li::before {
    content: "• ";
    position: absolute;
    left: 0;
    font-weight: bold;
}

a {
    color: var(--accent-blue);
    text-decoration: none
}

a:hover {
    text-decoration: underline
}
</style>