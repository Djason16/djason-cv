<template>
    <!-- Carousel pagination container -->
    <div class="carousel-pagination">
        <!-- Loop through the number of items and create a button for each item -->
        <button v-for="index in itemsLength" :key="index" :class="{ active: index - 1 === activeIndex }"
            @click="$emit('goToSlide', index)" :aria-label="`Go to slide ${index}`">
        </button>
    </div>
</template>

<script setup>
// Define props to receive from the parent component
// itemsLength: The total number of items in the carousel (used to create the pagination buttons)
// activeIndex: The index of the currently active slide, used to highlight the active pagination button
defineProps(["itemsLength", "activeIndex"]);
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
