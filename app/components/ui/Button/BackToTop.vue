<template>
    <!-- Show Back-to-Top button when scrolled down -->
    <button v-show="isVisible" @click="scrollToTop" class="back-to-top text-small"
        :aria-label="$lang.getTranslation('backToTop')" :title="$lang.getTranslation('backToTop')">
        <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
    </button>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const { $lang } = useNuxtApp()
const isVisible = ref(false) // track button visibility

// Smooth scroll to top
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

onMounted(() => {
    const onScroll = () => (isVisible.value = window.scrollY > 200) // show if scrolled >200px
    onScroll() // initial check
    window.addEventListener('scroll', onScroll)
    onUnmounted(() => window.removeEventListener('scroll', onScroll))
})
</script>

<style scoped>
.back-to-top {
    position: fixed;
    bottom: 7.25rem;
    right: calc((100vw - 90vw) / 5 - 0.875rem);
    background-color: var(--third-color);
    color: var(--text-color-light);
    border: none;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    opacity: 0.8;
    transition: opacity 0.3s ease;
    z-index: 10;
}

.back-to-top:hover {
    opacity: 1;
}

.back-to-top i {
    margin: 0;
}

@media (max-width: 1024px) {
    .back-to-top {
        background-color: var(--fifth-color);
        right: 1.5rem;
        opacity: .8;
    }

    .back-to-top:hover {
        opacity: .8;
    }
}
</style>
