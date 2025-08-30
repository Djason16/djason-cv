<template>
    <section id="about-me" class="about-section">
        <!-- Image gallery -->
        <AboutImages :images="images" />

        <div class="about-section__content">
            <!-- Section title -->
            <h2 class="about-section__title text-tall text-uppercase">
                {{ $lang.getTranslation('aboutMe') }}
            </h2>

            <!-- Description with dynamic variables (name, age) -->
            <div class="about-section__description text-normal">
                {{ $lang.getTranslation('aboutDescription', variables) }}
            </div>
        </div>
    </section>
</template>

<script setup>
import AboutImages from '~/components/ui/Image/AboutImages.vue'
import { personalInfo } from '~/utils/personalInfo'

// Compute age from birth date
const calculateAge = d => {
    const today = new Date(), age = today.getFullYear() - d.getFullYear()
    return today.getMonth() < d.getMonth() || (today.getMonth() === d.getMonth() && today.getDate() < d.getDate())
        ? age - 1 : age
}

// Prepare a set of 6 images by repeating base images
const baseImages = ['/images/matrix.jpg', '/images/moi.jpg']
const images = Array.from({ length: 6 }, (_, i) => baseImages[i % baseImages.length])

// Translation variables for dynamic interpolation
const variables = { name: personalInfo.name, age: calculateAge(personalInfo.birthDate) }
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