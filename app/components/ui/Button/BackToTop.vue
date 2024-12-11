<template>
    <!-- Button to scroll back to the top, only visible when isVisible is true -->
    <button v-show="isVisible" @click="scrollToTop" class="back-to-top text-small">
        <!-- Icon representing the arrow to go back to top -->
        <i class="fa-solid fa-arrow-up"></i>
    </button>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue"; // Vue 3 composition API

// Reactive reference to manage the visibility of the button
const isVisible = ref(false);

// Function to handle the scroll event and toggle the visibility of the button
function handleScroll() {
    // Show the button when the page is scrolled down more than 200 pixels
    isVisible.value = window.scrollY > 200;
}

// Function to scroll to the top of the page smoothly
function scrollToTop() {
    window.scrollTo({
        top: 0, // Scroll to the top of the page
        behavior: "smooth", // Smooth scrolling effect
    });
}

// Lifecycle hook to add event listener when the component is mounted
onMounted(() => {
    window.addEventListener("scroll", handleScroll); // Listen to scroll events
});

// Lifecycle hook to clean up when the component is unmounted
onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll); // Remove the event listener
});
</script>

<style scoped>
.back-to-top {
    position: fixed;
    bottom: 7.25rem;
    right: calc((100vw - 90vw) / 5 - 0.875rem);
    background-color: var(--third-color);
    color: var(--text-color-light);
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.3s ease;
    z-index: 10;
}

.back-to-top:hover {
    opacity: 1;
}

.back-to-top i {
    margin: 0;
}

@media (max-width: 1024px) {
    .back-to-top {
        background-color: var(--fifth-color);
        right: 1.5rem;
        opacity: .8;
    }

    .back-to-top:hover {
        opacity: .8;
    }
}
</style>
