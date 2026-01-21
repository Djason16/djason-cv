<template>
    <section id="about-me" class="about-section">
        <!-- Image gallery -->
        <AboutImages :images="images" />

        <div class="about-section__content">
            <h2 class="about-section__title text-tall text-uppercase">{{ $lang.getTranslation('aboutMe') }}</h2>
            <div class="about-section__description text-normal">
                {{ $lang.getTranslation('aboutDescription', variables) }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { useRuntimeConfig } from '#app'
import { onMounted, ref } from 'vue'
import AboutImages from '~/components/ui/Image/AboutImages.vue'

// Runtime config
const config = useRuntimeConfig()

// Calculate age from birth date
const calculateAge = d => {
    const today = new Date(), age = today.getFullYear() - d.getFullYear()
    return today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())
        ? age - 1 : age
}

// Simple array shuffle (Fisher-Yates)
const shuffleArray = arr => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

// Base images repeated to fill 6 slots
const baseImages = ['/images/me_1.jpg', '/images/me_2.jpg']
const images = ref([...baseImages, ...baseImages, ...baseImages].slice(0, 6))

// Shuffle only on client to avoid SSR hydration mismatch
onMounted(() => images.value = shuffleArray(images.value))

// Variables for translation interpolation
const birthDate = new Date(config.public.birthDate)
const variables = { name: config.public.name, address: config.public.legalAddress, age: calculateAge(birthDate) }
</script>

<style scoped>
.about-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 5rem;
    max-width: 80%;
    flex-wrap: wrap;
    margin: auto;
}

.about-section__content {
    flex: 1;
    max-width: 30%;
    text-align: right;
}

.about-section__title {
    margin: 0 0 1rem;
}

.about-section__description {
    margin: 0;
    line-height: 1.5;
}

@media (max-width: 1024px) {
    .about-section {
        flex-direction: column-reverse;
        gap: 2rem;
    }

    .about-section__content {
        max-width: 100%;
    }

    .about-section__title {
        margin: 0;
    }
}
</style>