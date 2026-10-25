<template>
    <!-- Floating button back to the top of the page, shown once the visitor scrolled down -->
    <FloatingButton :show="isVisible" :aria-label="t('backToTop')" @click="scrollToTop">
        <i class="fa-solid fa-arrow-up" aria-hidden="true" />
    </FloatingButton>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { onMounted, onUnmounted, ref } from 'vue'
import FloatingButton from '@/components/ui/Button/FloatingButton.vue'

const { getTranslation: t } = useLang()

const isVisible = ref(false)

// Smooth scroll back to top of the page
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
    // Show button once user scrolls past 200px
    const onScroll = () => (isVisible.value = window.scrollY > 200)

    // Runs once on mount to set initial state
    onScroll()
    window.addEventListener('scroll', onScroll)

    // Cleans up listener on unmount
    onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>