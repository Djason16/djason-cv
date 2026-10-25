<template>
    <!-- Home page: sections rendered in order by SectionLayout -->
    <SectionLayout :sections="sections" />
</template>

<script setup>
import SectionLayout from '@/components/ui/SectionLayout/SectionLayout.vue'
import AboutMe from '@/components/views/Index/AboutMe.vue'
import Hero from '@/components/views/Index/Hero.vue'
import LastProject from '@/components/views/Index/LastProject.vue'
import Services from '@/components/views/Index/Services.vue'
import Skills from '@/components/views/Index/Skills.vue'
import { useSeo } from '@/composables/useSeo.js'

// Ordered list of the home page sections (components/views/Index)
const sections = [Hero, LastProject, AboutMe, Skills, Services]

// Title, description, Open Graph... updated when the language changes (utils/seo.js)
useSeo('index')
</script>
