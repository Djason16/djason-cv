<template>
    <!-- Name of the signer of the provider, at the bottom of the quote or invoice -->
    <div class="signature-section text-bold text-small">{{ signerName }}</div>
</template>

<script setup>
defineProps({ signerName: String })
</script>
