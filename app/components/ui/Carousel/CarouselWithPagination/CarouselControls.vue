<template>
    <!-- Simple carousel controls with previous/next buttons -->
    <div class="carousel-controls">
        <FloatingButton :show="true" :aria-label="'Previous slide'" class="carousel-controls__btn" @click="prevSlide">
            <i class="fas fa-chevron-left" aria-hidden="true" />
        </FloatingButton>

        <FloatingButton :show="true" :aria-label="'Next slide'" class="carousel-controls__btn" @click="nextSlide">
            <i class="fas fa-chevron-right" aria-hidden="true" />
        </FloatingButton>
    </div>
</template>

<script setup>
import FloatingButton from '~/components/ui/Button/FloatingButton.vue';

// Props: functions to navigate slides, passed from parent
defineProps({ prevSlide: Function, nextSlide: Function })
</script>

<style scoped>
.carousel-controls {
    display: flex;
    gap: 0.75rem;
    position: absolute;
    bottom: 36px;
    left: 50%;
    transform: translateX(-50%);
}

.carousel-controls :deep(.floating-btn) {
    background: rgba(255, 255, 255, 0.5);
    color: var(--text-color-dark);
    opacity: 1;
}

.carousel-controls :deep(.floating-btn:hover) {
    background: rgba(255, 255, 255, 0.8);
    opacity: 1;
}

@media (max-width: 1024px) {
    .carousel-controls :deep(.floating-btn:hover) {
        background: rgba(255, 255, 255, 0.5);
    }
}
</style>