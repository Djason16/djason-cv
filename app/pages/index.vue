<template>
    <!-- Use SectionLayout to display the main sections of the home page -->
    <SectionLayout>
        <template v-slot:section-0>
            <Hero />
        </template>

        <template v-slot:section-1>
            <LastProject />
        </template>

        <template v-slot:section-2>
            <AboutMe />
        </template>

        <template v-slot:section-3>
            <Skills />
        </template>

        <template v-slot:section-4>
            <Services />
        </template>
    </SectionLayout>
</template>

<script setup>
import SectionLayout from "../components/ui/SectionLayout/SectionLayout.vue"; // Reusable layout component
import AboutMe from "../components/views/Index/AboutMe.vue"; // About me section component
import Hero from "../components/views/Index/Hero.vue"; // Hero section component
import LastProject from "../components/views/Index/LastProject.vue"; // Last project section component
import Services from "../components/views/Index/Services.vue"; // Services section component
import Skills from "../components/views/Index/Skills.vue"; // Skills section component
import { seoMetaData } from "../utils/seo.js"; // SEO configuration utility

// Current language context
const { $lang } = useNuxtApp();

// Set dynamic metadata for SEO purposes
const pageKey = 'index';
useSeoMeta(seoMetaData(pageKey, $lang));

// Watch for language changes and update SEO metadata dynamically
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang));
});
</script>

<style scoped></style>