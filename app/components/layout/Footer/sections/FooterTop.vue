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
    position: relative;
    padding: 3rem 2rem;
    padding-bottom: calc(3.5rem + 2px);
    transition: background-color 0.4s ease-in-out;
}

.footer-top::before {
    content: '';
    position: absolute;
    top: 0;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(to right,
            transparent,
            rgba(255, 255, 255, 0.25) 30%,
            rgba(255, 255, 255, 0.25) 70%,
            transparent);
}
</style>