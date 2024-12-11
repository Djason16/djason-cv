<template>
    <!-- Container for the top section of the footer with a dynamic background color -->
    <div :style="{ backgroundColor: color }" class="footer-top">
        <!-- The background color of this section is dynamically set using the 'color' prop -->
    </div>
</template>

<script setup>
// Define the props that this component expects to receive
const props = defineProps({
    // 'color' prop is used to dynamically set the background color of the footer section
    color: {
        type: String,   // The 'color' prop is expected to be a string value representing a color (e.g., '#ff0000', 'red')
        required: true, // The 'color' prop is required for this component to work
    },
});
</script>

<style scoped>
.footer-top {
    padding: 2rem;
    transition: background-color 0.3s ease-in-out;
}
</style>