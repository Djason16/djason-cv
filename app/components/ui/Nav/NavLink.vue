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
    // Get the element by its ID (passed via props)
    const element = document.getElementById(props.id);

    // Get the header element and calculate its height
    const header = document.querySelector("header");
    const headerHeight = header?.offsetHeight || 0;
    const extraPadding = 40; // Padding to adjust the final scroll position

    // If the element is found, calculate its position and scroll to it smoothly
    if (element) {
        const position =
            element.getBoundingClientRect().top + window.scrollY - headerHeight - extraPadding;

        // Smoothly scroll to the position
        window.scrollTo({
            top: position,
            behavior: "smooth",
        });
    } else {
        console.error(`Element with ID "${props.id}" not found.`); // Log an error if the element is not found
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