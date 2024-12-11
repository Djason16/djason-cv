<template>
    <!-- Carousel container with three child components: CarouselTrack, CarouselPagination, and CarouselControls -->
    <div class="carousel">
        <!-- CarouselTrack component that manages the sliding of the images -->
        <CarouselTrack :slides="slides" :trackStyle="trackStyle" :transitionEnabled="transitionEnabled" />

        <!-- CarouselPagination component for managing the pagination controls -->
        <CarouselPagination :itemsLength="props.items.length" :activeIndex="activePaginationIndex"
            @goToSlide="goToSlide" />

        <!-- CarouselControls component to handle the previous and next slide navigation -->
        <CarouselControls :prevSlide="prevSlide" :nextSlide="nextSlide" />
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue"; // Vue 3 Composition API
import CarouselControls from "./CarouselWithPagination/CarouselControls.vue"; // Child CarouselControls component
import CarouselPagination from "./CarouselWithPagination/CarouselPagination.vue"; // Child CarouselPagination component
import CarouselTrack from "./CarouselWithPagination/CarouselTrack.vue"; // Child CarouselTrack component

// Define the props passed from the parent component
const props = defineProps({
    // Items to be displayed in the carousel (should be an array of items)
    items: {
        type: Array,
        required: true,
    },
});

// Declare reactive variables and their default values
const currentSlide = ref(Math.floor(props.items.length / 2) + 1); // Track the current slide index
const transitionEnabled = ref(true); // Enable/Disable the sliding transition
const screenWidth = ref(1024); // Track screen width for responsive adjustments

// Function to update the screen width
function updateScreenWidth() {
    screenWidth.value = window.innerWidth;
}

// Set up event listeners for window resize to adjust the screen width dynamically
onMounted(() => {
    updateScreenWidth(); // Set initial screen width value
    window.addEventListener("resize", updateScreenWidth); // Listen for resize events
});

onUnmounted(() => {
    window.removeEventListener("resize", updateScreenWidth); // Clean up event listener on unmount
});

// Compute the list of slides, adding the first and last items for a continuous loop effect
const slides = computed(() => [
    props.items[props.items.length - 1], // Last item for loop
    ...props.items, // Actual slides
    props.items[0], // First item for loop
]);

// Calculate the style for the carousel track based on the screen size and current slide index
const trackStyle = computed(() => {
    const width = screenWidth.value <= 1024 ? 35 : 40; // Adjust the width of each slide based on screen size
    const gap = 1; // Space between slides
    const offset = width / 2; // Offset for centering the current slide
    return {
        transform: `translateX(calc(-${currentSlide.value} * (${width}rem + ${gap}rem) + 50% - ${offset}rem))`, // Translate the track to the correct position
        transition: transitionEnabled.value ? "transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)" : "none", // Apply transition if enabled
    };
});

// Function to change the current slide based on the selected index
const goToSlide = (index) => {
    transitionEnabled.value = true; // Enable the transition
    currentSlide.value = index; // Set the current slide to the selected index
};

// Function to navigate to the previous slide
const prevSlide = () => {
    goToSlide(currentSlide.value - 1); // Go to the previous slide
};

// Function to navigate to the next slide
const nextSlide = () => {
    goToSlide(currentSlide.value + 1); // Go to the next slide
};

// Compute the active pagination index based on the current slide index
const activePaginationIndex = computed(() => {
    return (currentSlide.value - 1 + props.items.length) % props.items.length; // Ensure the index is always within bounds
});

// Watch for changes in the current slide index and handle looping behavior
watch(currentSlide, (newVal) => {
    if (newVal === 0) { // Handle when the slide reaches 0
        transitionEnabled.value = false; // Disable the transition temporarily
        requestAnimationFrame(() => {
            currentSlide.value = props.items.length; // Set the slide to the last one
            transitionEnabled.value = true; // Re-enable the transition
        });
    } else if (newVal === props.items.length + 1) { // Handle when the slide exceeds the last index
        transitionEnabled.value = false; // Disable the transition temporarily
        requestAnimationFrame(() => {
            currentSlide.value = 1; // Set the slide to the first one
            transitionEnabled.value = true; // Re-enable the transition
        });
    }
});
</script>

<style scoped>
.carousel {
    position: relative;
    width: 100%;
}

@media (max-width: 1024px) {
    .carousel {
        overflow: hidden;
    }
}
</style>