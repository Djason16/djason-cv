<template>
    <!-- Container that triggers slide-in animation for its children -->
    <div ref="container" class="slide-in-from-right">
        <slot />
    </div>
</template>

<script setup>
import { gsap } from 'gsap'
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
    const children = [...container.value.children]

    // Set initial hidden + offset state
    gsap.set(children, { opacity: 0, x: '10%', force3D: true })

    // Animate when container enters viewport
    new IntersectionObserver(([entry], obs) => {
        if (entry.isIntersecting) {
            gsap.to(children, { opacity: 1, x: '0%', duration: 0.5, stagger: 0.2, delay: 0.1, ease: 'power2.out' })
            obs.disconnect()
        }
    }, { threshold: 0.1 }).observe(container.value)
})
</script>

<style scoped>
.slide-in-from-right {
    width: 100%;
    overflow: hidden;
    position: relative;
}

.slide-in-from-right>* {
    opacity: 0;
    transform: translateX(10%);
    will-change: opacity, transform;
}

.slide-in-from-right>*:hover {
    transform: translateX(0);
    opacity: 1;
}
</style>
