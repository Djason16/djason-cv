<template>
    <div class="sections-container">
        <!-- Loop through dynamic slots and render each section -->
        <section v-for="i in sectionCount" :key="i" class="section-wrapper"
            :style="{ backgroundColor: getColor(i - 1) }">
            <!-- Slide-in animation for content -->
            <SlideInFromRight>
                <div class="content" :class="{ 'content-last': i === sectionCount }">
                    <!-- Render slot content or fallback text -->
                    <slot :name="'section-' + (i - 1)">Section {{ i }}</slot>
                </div>
            </SlideInFromRight>

            <!-- Diagonal separator, skip for last section -->
            <div v-if="i < sectionCount" class="diagonal-separator">
                <!-- Shadow layer for depth -->
                <svg class="separator-shadow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150"
                    preserveAspectRatio="none"
                    :class="i % 2 === 0 ? 'diagonal-separator-normal' : 'diagonal-separator-inverted'">
                    <polygon points="0,0 1440,0 0,150" fill="rgba(0,0,0,0.05)" />
                </svg>
                <!-- Main layer -->
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150" preserveAspectRatio="none"
                    :class="i % 2 === 0 ? 'diagonal-separator-normal' : 'diagonal-separator-inverted'">
                    <polygon points="0,0 1440,0 0,150" :fill="getColor(i)" />
                </svg>
            </div>
        </section>

        <!-- Footer with color matching the last section -->
        <FooterTop :color="lastColor" />
    </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import FooterTop from '~/components/layout/Footer/sections/FooterTop.vue'
import { getColor } from '~/utils/sections'

// Detect all "section-*" slots dynamically
const sections = computed(() =>
    Object.keys(getCurrentInstance().slots).filter(s => s.startsWith('section-'))
)

// Compute total number of sections to render
const sectionCount = computed(() => sections.value.length)

// Footer color matches the last section
const lastColor = computed(() => getColor(sectionCount.value - 1))
</script>

<style scoped>
.sections-container {
    overflow: hidden;
}

.section-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    overflow: hidden;
    padding: 6rem;
}

.content {
    position: relative;
    z-index: 2;
    width: 100%;
    color: var(--text-color-light);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    height: auto;
    margin-bottom: calc(6vh + 80px);
}

.content:hover {
    transform: translateY(-4px);
}

.content-last {
    margin-bottom: 0;
}

.section-wrapper:nth-child(2n) .content {
    color: var(--text-color-dark);
}

.diagonal-separator {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 150px;
    z-index: 1;
}

.diagonal-separator .separator-shadow {
    position: absolute;
    top: 6px;
    left: 0;
    width: 100%;
    height: 100%;
}

.diagonal-separator svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
}

.diagonal-separator-normal {
    transform: rotateX(180deg) rotateY(180deg);
}

.diagonal-separator-inverted {
    transform: rotateX(180deg) rotateY(0deg);
}

@media (max-width: 1024px) {
    .section-wrapper {
        padding: 5vh 1.5rem;
    }

    .content {
        margin-bottom: calc(5vh + 100px);
    }

    .content-last {
        margin-bottom: 0;
    }
}
</style>