<template>
    <!-- Carousel controls container for navigating between slides -->
    <div class="carousel-controls">
        <!-- Button to go to the previous slide -->
        <button @click="prevSlide" aria-label="Previous Slide">
            <i class="fas fa-chevron-left"></i>
        </button>

        <!-- Button to go to the next slide -->
        <button @click="nextSlide" aria-label="Next Slide">
            <i class="fas fa-chevron-right"></i>
        </button>
    </div>
</template>

<script setup>
// Define the props for the previous and next slide navigation methods
defineProps(["prevSlide", "nextSlide"]);
</script>

<style scoped>
.carousel-controls {
    display: flex;
    gap: .75rem;
    position: absolute;
    bottom: 36px;
    left: 50%;
    transform: translateX(-50%);
}

.carousel-controls button {
    background: rgba(255, 255, 255, 0.5);
    color: var(--text-color-dark);
    border: none;
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.carousel-controls button:hover {
    background: rgba(255, 255, 255, 0.8);
}

@media (max-width: 1024px) {
    .carousel-controls button:hover {
        background: rgba(255, 255, 255, 0.5);
    }
}

@media (max-width: 768px) {
    .carousel-controls button {
        width: 30px;
        height: 30px;
    }
}
</style>
