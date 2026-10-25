<template>
    <!-- Colored band above the footer, same color as the last section of the page -->
    <div :style="{ backgroundColor: color }" class="footer-top"></div>
</template>

<script setup>
const { color } = defineProps({ color: { type: String, required: true } })
</script>
