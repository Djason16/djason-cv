<template>
    <FloatingButton :show="isVisible" :aria-label="$lang.getTranslation('backToTop')" @click="scrollToTop">
        <i class="fa-solid fa-arrow-up" aria-hidden="true" />
    </FloatingButton>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { onMounted, onUnmounted, ref } from 'vue'
import FloatingButton from '~/components/ui/Button/FloatingButton.vue'

const { $lang } = useNuxtApp()
const isVisible = ref(false)

// Smooth scroll back to top of the page
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
    // Show button once user scrolls past 200px
    const onScroll = () => (isVisible.value = window.scrollY > 200)

    // Run once on mount to set initial state
    onScroll()
    window.addEventListener('scroll', onScroll)

    // Clean up listener on unmount
    onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>