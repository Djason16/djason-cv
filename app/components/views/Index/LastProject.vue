<template>
    <!-- Home page: projects, in the card grid of the site (card-grid.css, larger cards): code at the top, name at the bottom,
         its photo shown on hover; a click opens its details in a modal (ProjectModal) -->
    <section id="projects" class="projects-section" aria-labelledby="projects-title">
        <SectionHead id="projects-title" reveal="zoom-group" :label="t('projectsLabel')" :title="t('lastProjects')" :text="t('projectDescription')" />

        <ol v-if="projects.length" class="card-grid card-grid--large projects-grid" :style="{ '--letters': longestWord(projects.map(p => p.name)) }">
            <!-- Their own animation: each card comes slightly closer while it fades in -->
            <li v-for="(project, i) in projects" :key="project.id" v-reveal="'zoom'" class="project-card"
                :style="{ '--reveal-delay': `calc(var(--reveal-stagger) * ${i % 6})` }">
                <button type="button" class="grid-card project-card__box" :aria-label="`${project.name} - ${t('viewMore')}`"
                    :title="project.name" @click="open(i, $event)">
                    <AppImage :src="project.thumb || project.img || '/images/default_image.jpg'" :fallback="project.thumb ? project.img : undefined"
                        :alt="project.name" width="960" height="640" />
                    <span class="grid-card__top">
                        <span class="grid-card__code eyebrow">{{ padIndex(i, 'PR') }}</span>
                    </span>
                    <span class="grid-card__name text-display-s">{{ project.name }}</span>
                </button>
            </li>
        </ol>

        <ProjectModal :project="current" :index="currentIndex" :active-button="activeButton" @close="currentIndex = -1" />
    </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { longestWord, padIndex } from '@/utils/display.js'
import AppImage from '@/components/ui/Image/AppImage.vue'
import SectionHead from '@/components/ui/SectionLayout/SectionHead.vue'
import ProjectModal from '@/components/views/Index/ProjectModal.vue'
import { useLang } from '@/composables/useLang.js'
import { useProjects } from '@/composables/useProjects.js'

const { getTranslation: t } = useLang()
const { projects, fetchProjects } = useProjects()

// Projects of the API: in the HTML for search engines...
await callOnce('projects', fetchProjects)
// ...and loaded again in the browser, so the projects added from the admin since the build show up
onMounted(fetchProjects)

// Project shown in the modal (-1: none), and the card it grows from
const currentIndex = ref(-1)
const current = computed(() => projects.value[currentIndex.value] || null)
const activeButton = ref(null)
const open = (i, event) => {
    activeButton.value = event.currentTarget
    currentIndex.value = i
}
</script>
