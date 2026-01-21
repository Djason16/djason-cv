<template>
    <!-- Carousel track container with optional transition -->
    <div class="carousel-track" :class="{ 'no-transition': !transitionEnabled }" :style="trackStyle">
        <!-- Loop through each slide -->
        <div v-for="(item, index) in slides" :key="item?.id || index" class="carousel-item">
            <!-- Only render if item exists -->
            <template v-if="item && item.name">
                <!-- Default slot content for slide -->
                <slot :item="item">
                    <div class="carousel-content">
                        <div class="carousel-overlay">
                            <!-- Slide title -->
                            <h3 class="project-title text-xlarge">{{ item.name }}</h3>
                            <!-- Short description -->
                            <p class="project-description text-normal">
                                {{ item.short }}
                            </p>
                            <!-- Skills list -->
                            <ul v-if="item.skills && item.skills.length > 0" class="project-skills">
                                <li v-for="(skill, i) in item.skills" :key="i" class="skill text-normal">
                                    {{ $lang.getTranslation(skill) || skill }}
                                </li>
                            </ul>
                            <!-- Optional external link -->
                            <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer"
                                :title="item.name + ' - ' + ($lang.getTranslation('viewMore') || 'View More')"
                                class="project-link text-normal text-bold text-uppercase">
                                {{ $lang.getTranslation('viewMore') || 'View More' }}
                            </a>
                        </div>
                        <!-- Slide image -->
                        <NuxtImg v-if="!fallbacks[index] && (item.image || item.img)" :src="item.image || item.img"
                            :alt="item.name" :title="item.name" class="carousel-image" width="640" height="480"
                            sizes="(max-width: 768px) 90vw, 640px" format="webp" loading="lazy" densities="1x 2x"
                            @error="onError(index)" placeholder />
                        <img v-else-if="item.image || item.img" :src="item.image || item.img"
                            :alt="`Fallback ${item.name}`" :title="`Fallback ${item.name}`" class="carousel-image"
                            loading="lazy" />
                    </div>
                </slot>
            </template>
        </div>
    </div>
</template>

<script setup>
import { useImageFallback } from '@/composables/useImageFallback.js';

// Props: slides array, dynamic track style, and transition toggle
defineProps({
    slides: {
        type: Array,
        default: () => []
    },
    trackStyle: Object,
    transitionEnabled: Boolean
})

// Composable to handle multiple fallbacks
const { fallbacks, onError } = useImageFallback(true)
</script>

<style scoped>
.carousel-track {
    display: flex;
    gap: 1rem;
    transition: transform 0.5s ease;
}

.carousel-track.no-transition {
    transition: none !important;
}

.carousel-item {
    flex: none;
    width: 40rem;
    height: 30rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: all 0.3s ease-in-out;
}

.carousel-content {
    position: relative;
    height: 100%;
    width: 100%;
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease-in-out, filter 0.3s ease-in-out;
    cursor: pointer;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.carousel-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    color: var(--text-color-light);
    opacity: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 10rem;
    transition: opacity 0.3s ease-in-out;
    z-index: 2;
}

.carousel-content:hover .carousel-overlay {
    opacity: 1;
}

.carousel-content:hover .carousel-image {
    filter: brightness(0.5);
}

.project-title {
    margin-bottom: 0.5rem;
}

.project-description {
    margin-bottom: 1rem;
}

.project-skills {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, auto);
    gap: 0.5rem;
    justify-content: center;
}

.project-skills li:nth-child(7),
.project-skills li:nth-child(8),
.project-skills li:nth-child(9) {
    grid-column: 2 / span 1;
    justify-self: center;
}

.skill {
    background: var(--first-color);
    color: var(--text-color-dark);
    padding: 0.25rem 0.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 5rem;
    border-radius: 4px;
}

.project-link {
    color: var(--text-color-light);
    text-decoration: none;
}

@media (max-width: 1024px) {
    .carousel-item {
        width: 35rem;
        height: 25rem;
    }

    .carousel-overlay {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        padding: 1rem;
    }

    .project-skills {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .carousel-overlay {
        align-items: center;
    }

    .project-description {
        padding-inline: 10rem;
    }

    .project-skills {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    .project-skills li:nth-child(7),
    .project-skills li:nth-child(8),
    .project-skills li:nth-child(9) {
        grid-column: 1 / span 2;
    }
}
</style>