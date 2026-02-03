<template>
    <!-- Client signature section with label, date, and signature line -->
    <div class="quote-signature-section">
        <div class="signature-box text-small">
            <div class="signature-label text-bold">{{ $lang.getTranslation('clientSignature') }}</div>
            <div class="signature-info">{{ $lang.getTranslation('signatureDate') }}: ___/___/______</div>
            <div class="signature-info">{{ $lang.getTranslation('signaturePrecedBy') }}</div>
            <div class="signature-line"></div>
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app';
const { $lang } = useNuxtApp() // Translation utility
</script>

<style scoped>
.quote-signature-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 30px;
}

.signature-box {
    border: 1px solid var(--second-color);
    padding: 20px;
    min-width: 300px;
    background: #fafbfc;
}

.signature-label {
    margin-bottom: 15px;
    font-size: 14px;
    color: var(--third-color);
}

.signature-info {
    margin-bottom: 10px;
    color: var(--text-color-dark);
}

.signature-line {
    margin-top: 40px;
    border-bottom: 2px solid var(--text-color-dark);
    width: 100%;
}
</style>