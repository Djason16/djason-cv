<template>
    <!-- Link element for navigating and scrolling to a section -->
    <span class="header-top__link text-normal text-bold text-uppercase" @click="handleClick">
        <!-- Slot for dynamically inserting content inside the link -->
        <slot></slot>
    </span>
</template>

<script setup>
import { nextTick } from "vue"; // Import nextTick for async operations
import { useRouter } from "vue-router"; // Import useRouter for navigation

// Define props for the component
const props = defineProps({
    id: {
        type: String, // ID of the section to scroll to
        required: true,
    },
});

const router = useRouter(); // Access the router for navigation

// Method triggered on clicking the link
const handleClick = async () => {
    // If the current route is not the homepage, navigate to it
    if (router.currentRoute.value.path !== "/") {
        await router.push("/"); // Navigate to the homepage
    }

    await nextTick(); // Wait for the next tick for the DOM to update

    scrollToSection(); // Scroll to the specified section
};

// Method to scroll to the specified section by ID
const scrollToSection = () => {
    // Get the target element by its ID
    const element = document.getElementById(props.id);

    // Get the header element to calculate its height
    const header = document.querySelector("header");

    // Calculate the header height or default to 0 if not found
    const headerHeight = header?.offsetHeight || 0;

    // Extra padding for better visual spacing during scrolling
    const extraPadding = 20;

    if (element) {
        // Check if the header currently has the 'sticky' class
        const isSticky = header.classList.contains("sticky");

        // If the header is sticky, use its height with additional padding
        const stickyOffset = isSticky ? headerHeight + extraPadding : 0;

        // Calculate the final scroll position
        // If the header is sticky, only subtract the header height and extra padding
        // If not sticky, subtract additional height to account for the difference
        const position =
            element.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            (isSticky ? extraPadding : headerHeight + extraPadding);

        // Smoothly scroll to the calculated position
        window.scrollTo({
            top: position,
            behavior: "smooth",
        });
    } else {
        // Log an error if the target element is not found
        console.error(`Element with ID "${props.id}" not found.`);
    }
};
</script>

<style scoped>
.header-top__link {
    text-decoration: none;
    color: var(--text-color-light);
    transition: color 0.3s ease;
    cursor: pointer;
}

.header-top__link:hover {
    color: var(--fourth-color);
}

@media (max-width:1024px) {
    .header-top__link:hover {
        color: inherit;
    }
}
</style>