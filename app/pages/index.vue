<template>
    <!-- Render home page sections dynamically in SectionLayout slots -->
    <SectionLayout>
        <template v-for="(section, i) in sections" :key="i" v-slot:[`section-${i}`]>
            <component :is="section" />
        </template>
    </SectionLayout>
</template>

<script setup>
import SectionLayout from '~/components/ui/SectionLayout/SectionLayout.vue'
import Hero from '~/components/views/Index/Hero.vue'
import LastProject from '~/components/views/Index/LastProject.vue'
import AboutMe from '~/components/views/Index/AboutMe.vue'
import Skills from '~/components/views/Index/Skills.vue'
import Services from '~/components/views/Index/Services.vue'
import { seoMetaData } from '~/utils/seo.js'

// Language context and SEO key
const { $lang } = useNuxtApp()

// Ordered list of home page sections
const sections = [Hero, LastProject, AboutMe, Skills, Services]

// Setup SEO and refresh on language changes
const pageKey = 'index'
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))
</script>

<style scoped></style>