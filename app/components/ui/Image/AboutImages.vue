<template>
    <div class="about-section__images">
        <div v-for="(row, r) in imageRows" :key="r" class="about-section__row">
            <div v-for="(img, i) in row" :key="i" class="about-section__image-wrapper">
                <NuxtImg :src="img" :alt="`About Me Image ${r * 3 + i + 1}`" class="about-section__image" width="250"
                    height="250" sizes="(max-width: 768px) 100vw, 250px" format="webp" loading="lazy" densities="1x 2x"
                    @error="handleImageError($event, r * 3 + i)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    images: { type: Array, default: () => [] }
})

const defaultImage = '/images/default_image.jpg'
const failedImages = ref(new Set())

// Prepare 6 images max, fallback to default if failed, split into 2 rows
const imageRows = computed(() => {
    const imgs = [...props.images].slice(0, 6).map((img, idx) =>
        failedImages.value.has(idx) ? defaultImage : img
    )
    while (imgs.length < 6) imgs.push(defaultImage)
    return [imgs.slice(0, 3), imgs.slice(3, 6)]
})

// Mark failed images and fallback
const handleImageError = (event, index) => {
    console.warn(`Image failed to load: ${props.images[index]}`)
    failedImages.value.add(index)
    event.target.src = defaultImage
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
    width: 100%;
    aspect-ratio: 1 / 1;
    flex-basis: calc(33.333% - 0.67rem);
    max-width: calc(33.333% - 0.67rem);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    background: var(--background-color-secondary);
}

.about-section__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease-in-out;
    will-change: transform;
}

.about-section__image-wrapper:hover .about-section__image {
    transform: scale(1.1);
}

@media (max-width: 1024px) {
    .about-section__images {
        max-width: 100%;
    }

    .about-section__row {
        gap: 0.5rem;
    }

    .about-section__image-wrapper {
        flex-basis: calc(50% - 0.25rem);
        max-width: calc(50% - 0.25rem);
    }
}

@media (max-width: 768px) {
    .about-section__image-wrapper {
        flex-basis: 100%;
        max-width: 100%;
    }

    .about-section__image-wrapper:hover .about-section__image {
        transform: none;
    }
}
</style>