<template>
    <!-- Top section of footer with dynamic background color -->
    <div :style="{ backgroundColor: color }" class="footer-top"></div>
</template>

<script setup>
// Prop to dynamically set the background color
const { color } = defineProps({ color: { type: String, required: true } })
</script>

<style scoped>
.footer-top {
    padding: 2rem;
    padding-bottom: calc(2rem + 2px);
    transition: background-color 0.3s ease-in-out;
}
</style>