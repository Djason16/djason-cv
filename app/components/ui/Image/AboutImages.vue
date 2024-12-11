<template>
    <!-- Wrapper for the images section -->
    <div class="about-section__images">
        <!-- Loop through image rows -->
        <div v-for="(rowImages, rowIndex) in imageRows" :key="rowIndex" class="about-section__row">
            <!-- Loop through each image in the row -->
            <div v-for="(image, index) in rowImages" :key="index" class="about-section__image-wrapper">
                <!-- Display image, fallback to default if not found -->
                <img :src="image || defaultImage" alt="About Me Image" class="about-section__image"
                    @error="handleImageError" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue"; // Vue 3 composition API

// Define the component's props, expecting an array of images
const props = defineProps({
    images: {
        type: Array, // Array of image URLs
        default: () => [null, null, null, null, null, null], // Default array of 6 null values (empty images)
    },
});

// Default fallback image in case an image fails to load
const defaultImage = "/images/default_image.jpg";

// Computed property to organize images into rows (each row has 3 images)
const imageRows = computed(() => {
    const filledImages = [...props.images]; // Copy of the provided images array
    // Fill the array with null values if less than 6 images are provided
    while (filledImages.length < 6) filledImages.push(null);
    // Return an array of two rows: first 3 images in one row, last 3 in another
    return [filledImages.slice(0, 3), filledImages.slice(3, 6)];
});

// Handle image error by replacing with default image if the provided image fails to load
function handleImageError(event) {
    event.target.src = defaultImage; // Replace broken image source with default image
}
</script>

<style scoped>
.about-section__images {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    max-width: 60%;
}

.about-section__row {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
}

.about-section__image-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
    aspect-ratio: 1;
    flex-basis: 50%;
    max-width: 50%;
    margin: 0 auto;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.about-section__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease-in-out;
}

.about-section__image-wrapper:hover .about-section__image {
    transform: scale(1.1);
}

@media (max-width: 1024px) {
    .about-section__images {
        max-width: 100%;
    }

    .about-section__image-wrapper {
        flex-basis: 80%;
        max-width: 80%;
    }

    .about-section__image-wrapper:hover .about-section__image {
        transform: none;
    }
}
</style>
