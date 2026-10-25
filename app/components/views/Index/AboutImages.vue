<template>
    <!-- Photos of the "About me" section -->
    <div class="about-section__images">
        <div v-for="(row, r) in imageRows" :key="r" class="about-section__row">
            <div v-for="(img, i) in row" :key="`${r}-${i}-${img.src}`" class="about-section__image-wrapper">
                <NuxtImg :src="img.src" :alt="img.alt" class="about-section__image" width="250" height="250"
                    :loading="img.eager ? 'eager' : 'lazy'" :fetchpriority="img.eager ? 'high' : 'auto'" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    images: { type: Array, default: () => [] }
})

// Computes up to 6 images split into 2 rows
const imageRows = computed(() => {
    const imgs = props.images.slice(0, 6)

    if (!imgs.length) return [[], []]

    while (imgs.length < 6) imgs.push(...imgs.slice(0, 6 - imgs.length))

    return [imgs.slice(0, 3), imgs.slice(3, 6)]
})
</script>
