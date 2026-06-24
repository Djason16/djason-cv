<template>
    <!-- Carousel track container with optional transition -->
    <div class="carousel-track" :class="{ 'no-transition': !transitionEnabled }" :style="trackStyle">
        <!-- Loop through each slide -->
        <article v-for="(item, index) in slides" :key="item?.id || index" class="carousel-item" role="group"
            aria-roledescription="slide" :aria-label="`${getRealIndex(index) + 1} / ${itemsLength}`">
            <!-- Only render if item exists -->
            <template v-if="item && item.name">
                <!-- Default slot content for slide -->
                <slot :item="item">
                    <div class="carousel-content">
                        <div class="carousel-overlay">
                            <!-- Slide title -->
                            <h3 class="project-title text-xlarge">{{ item.name }}</h3>

                            <!-- Short description -->
                            <p class="project-description text-normal">{{ item.short }}</p>

                            <!-- Skills list -->
                            <ul v-if="item.skills && item.skills.length > 0" class="project-skills">
                                <li v-for="(skill, i) in item.skills" :key="i" class="skill text-normal">
                                    {{ $lang.getTranslation(skill) || skill }}
                                </li>
                            </ul>

                            <!-- Optional external link -->
                            <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer"
                                :title="`${item.name} - ${$lang.getTranslation('viewMore') || 'View more'}`"
                                class="project-link text-normal text-bold">
                                {{ $lang.getTranslation('viewMore') || 'View more' }}
                            </a>
                        </div>

                        <!-- API image served directly (dynamic, no NuxtImg) -->
                        <img v-if="(item.image || item.img)?.startsWith('api/')" :src="item.image || item.img"
                            :alt="itemAlt(item)" class="carousel-image" loading="lazy" width="640" height="480" />

                        <!-- Static image via NuxtImg -->
                        <NuxtImg v-else-if="item.image || item.img" :src="item.image || item.img" :alt="itemAlt(item)"
                            class="carousel-image" width="640" height="480" loading="lazy" />
                    </div>
                </slot>
            </template>
        </article>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'

const { $lang } = useNuxtApp()

// Props: slides array, dynamic track style, and transition toggle
const props = defineProps({
    slides: { type: Array, default: () => [] },
    trackStyle: Object,
    transitionEnabled: Boolean,
    activeIndex: { type: Number, default: 0 },
    itemsLength: { type: Number, default: 0 }
})

const getRealIndex = index => {
    if (props.itemsLength <= 1) return index
    if (index === 0) return props.itemsLength - 1
    if (index === props.slides.length - 1) return 0
    return index - 1
}

const itemAlt = item => {
    if (!item?.name && !item?.short) return ''
    if (item?.short) return `${item.name} — ${item.short}`
    return item.name
}
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
    padding: 7rem;
    transition: opacity 0.3s ease-in-out;
    z-index: 2;
}

.carousel-content:hover .carousel-overlay,
.carousel-content:focus-within .carousel-overlay {
    opacity: 1;
}

.carousel-content:hover .carousel-image,
.carousel-content:focus-within .carousel-image {
    filter: brightness(0.5);
}

.project-title {
    margin: 0.5rem 0;
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
        width: 30rem;
        height: 20rem;
    }

    .carousel-overlay {
        opacity: 1;
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

    .project-title {
        margin: 0;
    }

    .project-description {
        padding-inline: 7rem;
    }

    .project-skills {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        margin: 0 0 0.5rem;
    }

    .project-skills li:nth-child(7),
    .project-skills li:nth-child(8),
    .project-skills li:nth-child(9) {
        grid-column: 1 / span 2;
    }
}
</style>