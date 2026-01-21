<template>
    <!-- Carousel pagination buttons, highlighting active slide -->
    <div class="carousel-pagination">
        <button v-for="i in visibleButtons" :key="i" :class="{ active: getSlideIndex(i) === activeIndex }"
            @click="$emit('goToSlide', getSlideIndex(i) + 1)"
            :aria-label="`Go to slide ${getSlideIndex(i) + 1}`"></button>
    </div>
</template>

<script setup>
import { computed } from 'vue'

// Props: total slides and currently active slide
const { itemsLength, activeIndex } = defineProps({ itemsLength: Number, activeIndex: Number })

// Maximum buttons to display at once
const MAX_BUTTONS = 5

// Compute number of buttons to show (capped at MAX_BUTTONS)
const visibleButtons = computed(() => Math.min(itemsLength, MAX_BUTTONS))

// Compute the slide index each button represents, centering around activeIndex if needed
const getSlideIndex = i => {
    if (itemsLength <= MAX_BUTTONS) return i - 1
    const half = Math.floor(MAX_BUTTONS / 2)
    let start = Math.max(0, activeIndex - half)
    if (start + MAX_BUTTONS > itemsLength) start = itemsLength - MAX_BUTTONS
    return start + i - 1
}
</script>

<style scoped>
.carousel-pagination {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
}

.carousel-pagination button {
    width: 1rem;
    height: 1rem;
    aspect-ratio: 1;
    border-radius: 50%;
    background: var(--fourth-color);
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    transition: background 0.3s ease;
}

.carousel-pagination button.active {
    background: var(--third-color);
    transform: scale(1.2);
    transition: transform 0.3s ease, background 0.3s ease;
}

@media (max-width: 1024px) {
    .carousel-pagination button.active {
        transform: none;
    }
}
</style>
