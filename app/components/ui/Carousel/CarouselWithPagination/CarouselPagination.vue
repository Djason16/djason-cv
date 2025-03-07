<template>
    <!-- Carousel pagination container -->
    <div class="carousel-pagination">
        <button v-for="index in visibleButtons" :key="index" :class="{ active: getActualIndex(index) === activeIndex }"
            @click="$emit('goToSlide', getActualIndex(index) + 1)"
            :aria-label="`Go to slide ${getActualIndex(index) + 1}`">
        </button>
    </div>
</template>

<script setup>
import { computed } from "vue";

// Define props to receive from the parent component
const props = defineProps(["itemsLength", "activeIndex"]);

// Number of buttons to display
const maxButtons = 5;

// Calculate the number of visible buttons
const visibleButtons = computed(() => Math.min(props.itemsLength, maxButtons));

// Fuction to calculate the actual index of the button
const getActualIndex = (index) => {
    if (props.itemsLength <= maxButtons) {
        return index - 1;
    }
    const halfMax = Math.floor(maxButtons / 2);
    let startIndex = Math.max(0, props.activeIndex - halfMax);

    if (startIndex + maxButtons > props.itemsLength) {
        startIndex = props.itemsLength - maxButtons;
    }

    return startIndex + index - 1;
};
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
