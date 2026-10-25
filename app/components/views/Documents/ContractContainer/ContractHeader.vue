<template>
    <!-- Header of the contract: logo and contract number -->
    <div class="header">
        <img :src="companyLogo" alt="Logo" class="logo" />
        <div class="contract-title">
            <h1 class="text-xlarge text-bold">{{ t('contractTitle') }}</h1>
            <p class="contract-number">
                {{ t('contractNumber', { year: contractYear, index: contractIndex }) }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
;

defineProps({
    companyLogo: String,
    contractYear: Number,
    contractIndex: String
})
</script>

<style scoped>
.header {
    text-align: left;
    margin-bottom: 30px;
    border-bottom: 3px solid var(--third-color);
    padding-bottom: 20px;
}

.logo {
    width: 200px;
    margin-bottom: 15px;
}

.contract-title h1 {
    color: var(--third-color);
    margin-bottom: 8px;
}

.contract-number {
    font-weight: 600;
    color: var(--text-color-dark);
    margin-top: 12px;
}
</style>