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
import { onMounted } from 'vue'
import CarouselWithPagination from '@/components/ui/Carousel/CarouselWithPagination.vue'
import { useProjects } from '@/composables/useProjects.js'

const { getTranslation: t } = useLang()

const { projects, fetchProjects } = useProjects()

// Fetches projects during SSR/initial render
await fetchProjects()

// Ensures projects are fetched on client mount if empty
onMounted(() => {
    if (!projects.value.length) fetchProjects()
})
</script>
