<template>
    <!-- Display company signer name in styled section -->
    <div class="signature-section text-bold text-small">{{ signerName }}</div>
</template>

<script setup>
const props = defineProps({ signerName: String }) // Receives name of signer
</script>

<style scoped>
.signature-section {
    color: var(--third-color);
    margin-top: 20px;
    text-align: center;
}
</style>