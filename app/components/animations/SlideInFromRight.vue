<template>
    <!-- Container for animated content -->
    <!-- This container triggers a GSAP animation when its children become visible -->
    <div ref="animatedContainer" class="slide-in-from-right">
        <slot /> <!-- Allows dynamic content to be passed into the component -->
    </div>
</template>

<script setup>
import "intersection-observer"; // Polyfill for older browsers that lack IntersectionObserver support
import { gsap } from "gsap"; // GSAP library for animations
import { onMounted, onUnmounted, ref } from "vue"; // Vue 3 Composition API

// Reference to the animated container
const animatedContainer = ref(null);

// IntersectionObserver instance
let observer = null;

// Lifecycle hook executed when the component is mounted to the DOM
onMounted(() => {
    // Check if the animated container exists in the DOM
    if (animatedContainer.value) {
        // Get all child elements within the container
        const children = Array.from(animatedContainer.value.children);

        // Set the initial state of the child elements using GSAP (invisible and slightly shifted to the right)
        gsap.set(children, { opacity: 0, x: "10%", force3D: true });

        // Initialize IntersectionObserver to detect when the container becomes visible
        observer = new IntersectionObserver(
            (entries) => {
                // Callback triggered when the visibility of the container changes
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // If the container is visible, animate its children
                        gsap.to(children, {
                            opacity: 1, // Make children fully visible
                            x: "0%", // Reset their horizontal position
                            duration: 0.5, // Duration of the animation
                            stagger: { amount: 0.2, from: "start", ease: "power2.out" }, // Stagger animation between children
                            delay: 0.1, // Slight delay before starting the animation
                        });

                        // Stop observing the container once the animation is triggered
                        observer.unobserve(animatedContainer.value);
                    }
                });
            },
            {
                // Set the visibility threshold (10% of the container must be visible to trigger the animation)
                threshold: 0.1,
            }
        );

        // Start observing the animated container
        observer.observe(animatedContainer.value);
    }
});

// Lifecycle hook executed before the component is destroyed
onUnmounted(() => {
    // Disconnect the observer to prevent memory leaks
    if (observer) {
        observer.disconnect();
    }
});
</script>

<style scoped>
.slide-in-from-right {
    width: 100%;
    overflow: hidden;
    position: relative;
}

.slide-in-from-right>* {
    opacity: 0;
    transform: translateX(10%);
    will-change: opacity, transform;
}

.slide-in-from-right>*:hover {
    transform: translateX(0);
    opacity: 1;
}
</style>
