<template>
    <!-- Images grid split into two rows of three, fallback applied for missing/broken images -->
    <div class="about-section__images">
        <div v-for="(row, r) in imageRows" :key="r" class="about-section__row">
            <div v-for="(img, i) in row" :key="i" class="about-section__image-wrapper">
                <NuxtImg :src="img" :alt="`About Me Image ${r * 3 + i + 1}`" class="about-section__image" :width="250"
                    :height="250" sizes="250px" format="webp" loading="lazy" densities="1x 2x" placeholder
                    @error="handleImageError($event, r * 3 + i)" />
                <!-- Use fallback if image fails -->
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

// Props: images array, defaults to empty
const props = defineProps({ images: { type: Array, default: () => [] } })

// Default image used when missing or broken
const defaultImage = '/images/default_image.jpg'

// Computed: take first 6 images, fill missing with default, split into 2 rows
const imageRows = computed(() => {
    const imgs = [...props.images].slice(0, 6)
    while (imgs.length < 6) imgs.push(defaultImage)
    return [imgs.slice(0, 3), imgs.slice(3, 6)]
})
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
