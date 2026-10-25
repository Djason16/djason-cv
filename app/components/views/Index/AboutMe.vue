<template>
    <!-- Home page: "About me" section (age, location, photos) -->
    <section id="about-me" class="about-section" aria-labelledby="about-me-title">
        <!-- Image gallery -->
        <AboutImages :images="images" />

        <div class="about-section__content">
            <h2 id="about-me-title" class="about-section__title text-tall text-uppercase">
                {{ t('aboutMe') }}
            </h2>

            <div class="about-section__description text-normal">
                {{ t('aboutDescription', variables) }}
            </div>
        </div>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { useRuntimeConfig } from '#app'
import { onMounted, ref } from 'vue'
import AboutImages from '@/components/views/Index/AboutImages.vue'

const { getTranslation: t } = useLang()

const config = useRuntimeConfig()
const site = useSite()

// Calculates age from birth date
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
const baseImages = [
    {
        src: '/images/me_1.jpg',
        alt: `Selfie de ${site.name}.`,
        eager: true,
    },
    {
        src: '/images/me_2.jpg',
        alt: `${site.name} en costume, portrait professionnel.`,
        eager: false,
    }
]

const images = ref([...baseImages, ...baseImages, ...baseImages].slice(0, 6))

// Shuffle only on client to avoid SSR hydration mismatch
onMounted(() => images.value = shuffleArray(images.value))

// Variables for translation interpolation
const birthDate = new Date(config.public.birthDate)
const variables = {
    name: site.name,
    address: config.public.legalAddress,
    age: calculateAge(birthDate)
}
</script>
