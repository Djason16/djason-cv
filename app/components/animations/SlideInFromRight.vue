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
    const children = container.value.children

    // Set initial hidden + offset state on GPU
    gsap.set(children, { opacity: 0, xPercent: 10, force3D: true, willChange: 'opacity, transform' })

    // Animate when container enters viewport
    const observer = new IntersectionObserver(([entry], obs) => {
        if (entry.isIntersecting) {
            gsap.to(children, {
                opacity: 1,
                xPercent: 0,
                duration: 0.8,
                stagger: 0.25,
                ease: 'power2.out'
            })
            obs.disconnect()
        }
    }, { threshold: 0.1 })

    observer.observe(container.value)
})
</script>

<style scoped>
.slide-in-from-right {
    width: 100%;
    overflow: hidden;
    position: relative;
}

.slide-in-from-right>* {
    will-change: opacity, transform;
}
</style>