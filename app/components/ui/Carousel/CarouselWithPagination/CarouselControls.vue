<template>
    <!-- Previous / next buttons of the carousel -->
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
import FloatingButton from '@/components/ui/Button/FloatingButton.vue';

defineProps({ prevSlide: Function, nextSlide: Function })
</script>
