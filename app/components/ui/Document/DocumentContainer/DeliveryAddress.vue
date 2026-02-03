<template>
    <!-- Show delivery address label and value -->
    <div class="delivery-section text-small">
        <strong>{{ $lang.getTranslation('deliveryAddress') }}:</strong> {{ deliveryAddress }}
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app';
const props = defineProps({ deliveryAddress: String, clientType: String })
const { $lang } = useNuxtApp() // Access translation utilities
</script>

<style scoped>
.delivery-section {
    color: var(--text-color-dark);
    margin-bottom: 30px;
}
</style>