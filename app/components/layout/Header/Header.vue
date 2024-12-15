<template>
    <!-- Header element with sticky behavior based on scroll position -->
    <header :class="{ sticky: isSticky }" ref="header">
        <!-- HeaderTop component that contains the top section of the header -->
        <HeaderTop />
    </header>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'; // Vue 3 composition API
import HeaderTop from './sections/HeaderTop.vue'; // HeaderTop component

// Define a reactive variable 'isSticky' to control whether the header should be sticky
const isSticky = ref(false);

// Reference to the header element for potential direct DOM manipulation (if needed)
const header = ref(null);

// Function to check scroll position and toggle 'sticky' class
const handleScroll = () => {
    // Set 'isSticky' to true if the window is scrolled down, otherwise false
    isSticky.value = window.scrollY > 0;
};

// Setup lifecycle hooks to add and remove scroll event listeners
onMounted(() => {
    // Ensure `isSticky` is applied on page load
    handleScroll();
    // Add scroll event listener when the component is mounted
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    // Remove scroll event listener when the component is unmounted to avoid memory leaks
    window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
header {
    position: relative;
    background-color: var(--third-color);
    padding: 0;
    z-index: 15;
    transition: background-color 0.5s ease-in-out, box-shadow 0.5s ease-in-out, padding 0.5s ease-in-out, width 0.5s ease-in-out;
}

header.sticky {
    position: fixed;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    padding: 0.5rem 0;
    background-color: rgba(82, 97, 107, 0.75);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 25;
}

@media (max-width: 1024px) {
    header.sticky {
        width: 100%;
    }
}
</style>