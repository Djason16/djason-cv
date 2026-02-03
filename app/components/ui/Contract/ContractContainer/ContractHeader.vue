<template>
    <!-- Contract header with logo and dynamic contract number -->
    <div class="header">
        <img :src="companyLogo" alt="Logo" class="logo" />
        <div class="contract-title">
            <h1 class="text-xlarge text-bold">{{ $lang.getTranslation('contractTitle') }}</h1>
            <p class="contract-number">
                {{ $lang.getTranslation('contractNumber', { year: contractYear, index: contractIndex }) }}
            </p>
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app';
const { $lang } = useNuxtApp()

const props = defineProps({
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