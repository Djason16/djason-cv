<template>
    <!-- Signature of the client on a quote: mention, date and signature line -->
    <div class="quote-signature-section">
        <div class="signature-box text-small">
            <div class="signature-label text-bold">{{ t('clientSignature') }}</div>
            <div class="signature-info">{{ t('signatureDate') }}: ___/___/______</div>
            <div class="signature-info">{{ t('signaturePrecedBy') }}</div>
            <div class="signature-line"></div>
        </div>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
;
</script>
