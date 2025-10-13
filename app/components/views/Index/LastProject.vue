<template>
    <!-- Projects section wrapper -->
    <section id="projects" class="projects-section">
        <div class="projects-section__content">
            <h2 class="projects-section__title text-tall text-uppercase">
                {{ $lang.getTranslation('lastProjects') }}
            </h2>
            <div class="projects-section__description text-normal">
                {{ $lang.getTranslation('projectDescription') }}
            </div>
        </div>

        <!-- Carousel showcasing projects -->
        <div class="projects-section__carousel">
            <CarouselWithPagination :items="projects" />
        </div>
    </section>
</template>

<script setup>
import CarouselWithPagination from '~/components/ui/Carousel/CarouselWithPagination.vue'; // Handles project slides
import { useProjects } from '~/composables/useProjects.js'

const projects = useProjects()
</script>

<style scoped>
.projects-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 5rem;
    max-width: 80%;
}

.projects-section__content {
    flex: 1;
    max-width: 30%;
    text-align: left;
}

.projects-section__title {
    margin: 0 0 1rem;
}

.projects-section__description {
    margin: 0;
    line-height: 1.5;
}

.projects-section__carousel {
    flex: 1;
    max-width: 70%;
    clip-path: polygon(10% 0, 100% 0, 90% 101%, 0 100%);
}

@media (max-width: 1024px) {
    .projects-section {
        flex-direction: column;
        gap: 2rem;
    }

    .projects-section__content,
    .projects-section__carousel {
        max-width: 100%;
    }

    .projects-section__carousel {
        clip-path: none;
    }

    .projects-section__title {
        margin: 0;
    }
}
</style>
