<template>
    <!-- Delivery address of the quote or invoice -->
    <div class="delivery-section text-small">
        <strong>{{ t('deliveryAddress') }}:</strong> {{ deliveryAddress }}
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
;
defineProps({ deliveryAddress: String, clientType: String })
</script>
