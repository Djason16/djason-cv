<template>
    <!-- Pagination dots of the carousel, the current slide highlighted -->
    <div class="carousel-pagination" aria-label="Carousel pagination">
        <button v-for="i in visibleButtons" :key="i" :class="{ active: getSlideIndex(i) === activeIndex }"
            :aria-label="`Go to slide ${getSlideIndex(i) + 1}`"
            :aria-current="getSlideIndex(i) === activeIndex ? 'true' : undefined"
            @click="$emit('goToSlide', getSlideIndex(i) + 1)"></button>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const { itemsLength, activeIndex } = defineProps({ itemsLength: Number, activeIndex: Number })

// Maximum buttons to display at once
const MAX_BUTTONS = 5

// Computes number of buttons to show (capped at MAX_BUTTONS)
const visibleButtons = computed(() => Math.min(itemsLength, MAX_BUTTONS))

// Computes the slide index each button represents, centering around activeIndex if needed
const getSlideIndex = i => {
    if (itemsLength <= MAX_BUTTONS) return i - 1
    const half = Math.floor(MAX_BUTTONS / 2)
    let start = Math.max(0, activeIndex - half)
    if (start + MAX_BUTTONS > itemsLength) start = itemsLength - MAX_BUTTONS
    return start + i - 1
}
</script>
