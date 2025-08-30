<template>
    <!-- Carousel container with track, pagination, and controls -->
    <div class="carousel">
        <CarouselTrack :slides="slides" :trackStyle="trackStyle" :transitionEnabled="transitionEnabled" />
        <CarouselPagination :itemsLength="props.items.length" :activeIndex="activePaginationIndex"
            @goToSlide="goToSlide" />
        <CarouselControls :prevSlide="prevSlide" :nextSlide="nextSlide" />
    </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import CarouselControls from './CarouselWithPagination/CarouselControls.vue'
import CarouselPagination from './CarouselWithPagination/CarouselPagination.vue'
import CarouselTrack from './CarouselWithPagination/CarouselTrack.vue'

// Props: items to display
const props = defineProps({ items: { type: Array, required: true } })

// Reactive state
const currentSlide = ref(Math.floor(props.items.length / 2) + 1) // starting slide
const transitionEnabled = ref(true)
const screenWidth = ref(1024) // default SSR width

// Slide constants
const SLIDE_WIDTH_DESKTOP = 40, SLIDE_WIDTH_MOBILE = 35, SLIDE_GAP = 1

// Update width on resize (client-side)
const updateScreenWidth = () => process.client && (screenWidth.value = window.innerWidth)
onMounted(() => { updateScreenWidth(); window.addEventListener('resize', updateScreenWidth) })
onUnmounted(() => process.client && window.removeEventListener('resize', updateScreenWidth))

// Slides array with cloned first and last for seamless looping
const slides = computed(() => [props.items[props.items.length - 1], ...props.items, props.items[0]])

// Compute transform style for track movement
const trackStyle = computed(() => {
    const width = screenWidth.value <= 1024 ? SLIDE_WIDTH_MOBILE : SLIDE_WIDTH_DESKTOP
    const offset = width / 2
    return {
        transform: `translateX(calc(-${currentSlide.value} * (${width}rem + ${SLIDE_GAP}rem) + 50% - ${offset}rem))`,
        transition: transitionEnabled.value ? 'transform 0.8s cubic-bezier(0.25,0.1,0.25,1)' : 'none'
    }
})

// Navigation methods
const goToSlide = i => currentSlide.value = i
const prevSlide = () => goToSlide(currentSlide.value - 1)
const nextSlide = () => goToSlide(currentSlide.value + 1)

// Active dot index for pagination
const activePaginationIndex = computed(() => (currentSlide.value - 1 + props.items.length) % props.items.length)

// Seamless looping: reset index without transition when hitting clone slides
watch(currentSlide, newVal => {
    if (newVal === 0) { transitionEnabled.value = false; requestAnimationFrame(() => { currentSlide.value = props.items.length; transitionEnabled.value = true }) }
    else if (newVal === props.items.length + 1) { transitionEnabled.value = false; requestAnimationFrame(() => { currentSlide.value = 1; transitionEnabled.value = true }) }
})
</script>

<style scoped>
.carousel {
    position: relative;
    width: 100%;
}

@media (max-width: 1024px) {
    .carousel {
        overflow: hidden;
    }
}
</style>