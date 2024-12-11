<template>
    <!-- Container for the animated content, will animate its children when they become visible -->
    <div ref="animatedContainer" class="slide-in-from-right">
        <slot /> <!-- Placeholder for the content passed to this component -->
    </div>
</template>

<script setup>
import { gsap } from "gsap"; // GSAP animation library
import { onMounted, onUnmounted, ref } from "vue"; // Vue 3 composition API

// Reference to the container element
const animatedContainer = ref(null);

// Declare the IntersectionObserver to detect when the container is visible on screen
let observer = null;

// Lifecycle hook to initialize the observer when the component is mounted
onMounted(() => {
    // Check if the animated container exists in the DOM
    if (animatedContainer.value) {
        // Get all child elements inside the container
        const children = Array.from(animatedContainer.value.children);

        // Set initial state of the child elements (invisible and shifted slightly to the right)
        gsap.set(children, { opacity: 0, x: "10%" });

        // Initialize the IntersectionObserver to detect when the container is in view
        observer = new IntersectionObserver(
            // Callback function that gets triggered when the visibility of the container changes
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // If the container is visible, animate its children
                        gsap.to(children, {
                            opacity: 1, // Make children fully visible
                            x: "0%", // Move them back to their original position
                            duration: .5, // Set the duration of the animation
                            stagger: {
                                amount: .2, // Delay stagger between each child
                                from: "start", // Start the stagger from the first child
                                ease: 'power2.out', // Set the easing for the animation
                            },
                            delay: .1, // Delay before starting the animation
                        });

                        // Once the animation is triggered, stop observing the container
                        observer.unobserve(animatedContainer.value);
                    }
                });
            },
            // Set the visibility threshold for triggering the animation (25% of the container must be in view)
            {
                threshold: 0.25,
            }
        );

        // Start observing the animated container
        observer.observe(animatedContainer.value);
    }
});

// Cleanup the observer when the component is unmounted
onUnmounted(() => {
    if (observer) {
        observer.disconnect(); // Disconnect the observer to prevent memory leaks
    }
});
</script>

<style scoped>
.slide-in-from-right {
    width: 100%;
    overflow: hidden;
}

.slide-in-from-right>* {
    opacity: 0;
    transform: translateX(10%);
}
</style>
