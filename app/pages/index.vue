<template>
    <!-- Use SectionLayout to display all home page sections dynamically -->
    <SectionLayout>
        <!-- Loop through each section and inject it into a named slot -->
        <template v-for="(section, index) in sections" :key="index" v-slot:[`section-${index}`]>
            <component :is="section" />
        </template>
    </SectionLayout>
</template>

<script setup>
import SectionLayout from "../components/ui/SectionLayout/SectionLayout.vue";

// Import all section components
import Hero from "../components/views/Index/Hero.vue";
import LastProject from "../components/views/Index/LastProject.vue";
import AboutMe from "../components/views/Index/AboutMe.vue";
import Skills from "../components/views/Index/Skills.vue";
import Services from "../components/views/Index/Services.vue";

import { seoMetaData } from "../utils/seo.js";

// Define ordered list of sections
const sections = [Hero, LastProject, AboutMe, Skills, Services];

// Language and SEO context
const { $lang } = useNuxtApp();
const pageKey = "index";

// Initial SEO setup
useSeoMeta(seoMetaData(pageKey, $lang));

// Watch language changes and refresh SEO meta
watch(() => $lang.current.value, () => {
    useSeoMeta(seoMetaData(pageKey, $lang));
});
</script>  

<style scoped></style>