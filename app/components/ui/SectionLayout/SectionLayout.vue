<template>
    <!-- Each component of "sections" in its own <section>, in order, with a diagonal separator between two sections
         (style: assets/css/components/section-layout.css) -->
    <div class="sections-container">
        <section v-for="(section, index) in sections" :key="index" class="section-wrapper"
            :style="{ backgroundColor: getColor(index) }">
            <SlideInFromRight>
                <div class="content" :class="{ 'content-last': index === sections.length - 1 }">
                    <component :is="section" />
                </div>
            </SlideInFromRight>

            <!-- Diagonal towards the color of the next section: a soft shadow, then the shape itself -->
            <div v-if="index < sections.length - 1" class="diagonal-separator"
                :class="index % 2 ? 'diagonal-separator-normal' : 'diagonal-separator-inverted'">
                <svg class="separator-shadow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150"
                    preserveAspectRatio="none" aria-hidden="true">
                    <polygon points="0,0 1440,0 0,150" fill="rgba(0,0,0,0.05)" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150" preserveAspectRatio="none"
                    aria-hidden="true">
                    <polygon points="0,0 1440,0 0,150" :fill="getColor(index + 1)" />
                </svg>
            </div>
        </section>

        <!-- Top of the footer, in the color of the last section -->
        <FooterTop :color="getColor(sections.length - 1)" />
    </div>
</template>

<script setup>
import FooterTop from '@/components/layout/Footer/FooterTop.vue'
import SlideInFromRight from '@/components/ui/Animation/SlideInFromRight.vue'
import { getColor } from '@/utils/sections.js'

defineProps({
    sections: { type: Array, required: true },
})
</script>
