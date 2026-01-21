<template>
    <!-- Carousel container with track, pagination, and controls -->
    <div v-if="validItems.length" class="carousel">
        <CarouselTrack :slides="slides" :trackStyle="trackStyle" :transitionEnabled="transitionEnabled" />
        <CarouselPagination :itemsLength="validItems.length" :activeIndex="activePaginationIndex"
            @goToSlide="goToSlide" />
        <CarouselControls :prevSlide="prevSlide" :nextSlide="nextSlide" />
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import CarouselTrack from './CarouselWithPagination/CarouselTrack.vue'
import CarouselPagination from './CarouselWithPagination/CarouselPagination.vue'
import CarouselControls from './CarouselWithPagination/CarouselControls.vue'

// Props: array of items to display
const props = defineProps({ items: { type: Array, required: true, default: () => [] } })

// Filter out invalid items without a name
const validItems = computed(() => props.items.filter(item => item?.name))

// Reactive state
const currentSlide = ref(1)               // Start at first real slide
const transitionEnabled = ref(true)       // Track CSS transition toggle
const screenWidth = ref(1024)             // Default width (SSR)

// Slide constants
const SLIDE_WIDTH_DESKTOP = 40
const SLIDE_WIDTH_MOBILE = 35
const SLIDE_GAP = 1

// Update screen width on client resize
const updateScreenWidth = () => process.client && (screenWidth.value = window.innerWidth)
onMounted(() => {
    updateScreenWidth()
    window.addEventListener('resize', updateScreenWidth)
})
onUnmounted(() => process.client && window.removeEventListener('resize', updateScreenWidth))

// Slides with cloned first and last for seamless looping
const slides = computed(() => validItems.value.length
    ? [validItems.value[validItems.value.length - 1], ...validItems.value, validItems.value[0]]
    : []
)

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
const activePaginationIndex = computed(() => validItems.value.length
    ? (currentSlide.value - 1 + validItems.value.length) % validItems.value.length
    : 0
)

// Seamless looping: reset index without transition on clone slides
watch(currentSlide, newVal => {
    if (!validItems.value.length) return

    if (newVal === 0) {
        transitionEnabled.value = false
        requestAnimationFrame(() => {
            currentSlide.value = validItems.value.length
            transitionEnabled.value = true
        })
    }
    else if (newVal === validItems.value.length + 1) {
        transitionEnabled.value = false
        requestAnimationFrame(() => {
            currentSlide.value = 1
            transitionEnabled.value = true
        })
    }
})

// Reset to first slide if items change and current index is out of bounds
watch(() => validItems.value.length, (newLength) => {
    if (newLength && currentSlide.value > newLength) currentSlide.value = 1
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