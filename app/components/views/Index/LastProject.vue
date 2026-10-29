<template>
    <!-- Home page: carousel of the projects -->
    <section id="projects" class="projects-section" aria-labelledby="projects-section__title">
        <!-- Section header -->
        <div class="projects-section__content">
            <h2 id="projects-section__title" class="projects-section__title text-tall text-uppercase">
                {{ t('lastProjects') }}
            </h2>

            <div class="projects-section__description text-normal">
                {{ t('projectDescription') }}
            </div>
        </div>

        <!-- Carousel only if projects exist -->
        <div v-if="projects.length" class="projects-section__carousel">
            <CarouselWithPagination :items="projects" />
        </div>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import CarouselWithPagination from '@/components/ui/Carousel/CarouselWithPagination.vue'
import { useProjects } from '@/composables/useProjects.js'

const { getTranslation: t } = useLang()

const { projects, fetchProjects } = useProjects()

// Projects of the API: loaded once by the server, reused by the browser (no second request)
await callOnce('projects', fetchProjects)
</script>
