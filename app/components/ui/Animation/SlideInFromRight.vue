<template>
    <!-- Container whose children slide in from the right when they appear on screen -->
    <div ref="container" class="slide-in-from-right">
        <slot />
    </div>
</template>

<script setup>
import { gsap } from 'gsap'
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const children = container.value.children

    // Sets initial hidden + offset state on GPU
    gsap.set(children, { opacity: 0, xPercent: 10, force3D: true, willChange: 'opacity, transform' })

    // Animates when container enters viewport
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
