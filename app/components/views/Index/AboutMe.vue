<template>
    <!-- About me section container -->
    <section id="about-me" class="about-section">
        <!-- Component to display a grid of images related to the "About Me" section -->
        <AboutImages :images="[
            '/images/matrix.jpg',
            '/images/moi.jpg',
            '/images/matrix.jpg',
            '/images/moi.jpg',
            '/images/matrix.jpg',
            '/images/moi.jpg'
        ]" />

        <div class="about-section__content">
            <!-- About me section title -->
            <h2 class="about-section__title text-tall text-uppercase">
                {{ $lang.getTranslation('aboutMe') }}
            </h2>
            <!-- About me section description -->
            <div class="about-section__description text-normal">
                {{ $lang.getTranslation('aboutDescription', variables) }}
            </div>
        </div>
    </section>
</template>

<script setup>
import AboutImages from '~/components/ui/Image/AboutImages.vue'; // About images component
import { personalInfo } from '~/utils/personalInfo'; // Personal information data

/**
 * Calculates the age based on the birth date.
 */
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// Get the name and age from personal information
const variables = {
    name: personalInfo.name,
    age: calculateAge(personalInfo.birthDate)
};
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