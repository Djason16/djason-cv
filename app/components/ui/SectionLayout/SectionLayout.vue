<template>
    <!-- Container for the entire sections -->
    <div class="sections-container">
        <!-- Loop through each section and render the corresponding content -->
        <section v-for="index in sectionCount" :key="index" class="section-wrapper"
            :style="{ backgroundColor: getColor(index - 1) }">

            <!-- Slide-in animation for each section -->
            <SlideInFromRight>
                <div class="content" :class="{ 'content-last': index === sectionCount }">
                    <slot :name="'section-' + (index - 1)">Section {{ index }}</slot>
                </div>
            </SlideInFromRight>

            <!-- Diagonal separator between sections (except for the last one) -->
            <div v-if="index < sectionCount" class="diagonal-separator">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none"
                    :class="index % 2 === 0 ? 'diagonal-separator-normal' : 'diagonal-separator-inverted'">
                    <polygon points="0,0 1440,0 0,100" :fill="getColor(index)" />
                </svg>
            </div>
        </section>

        <!-- Footer section at the end of the content, with dynamic color -->
        <FooterTop :color="lastColor" />
    </div>
</template>

<script setup>
import { computed, getCurrentInstance } from "vue"; // Vue 3 composition API
import SlideInFromRight from "~/components/animations/SlideInFromRight.vue"; // Slide-in animation component
import FooterTop from "~/components/layout/Footer/sections/FooterTop.vue"; // Footer top component
import { getColor } from "~/utils/sections"; // Function to get section color

// Computed property to get the number of sections
const sectionCount = computed(() => {
    const slots = Object.keys(getCurrentInstance().slots).filter((slot) =>
        slot.startsWith("section-")
    );
    return slots.length;
});

// Computed property to get the color of the last section
const lastColor = computed(() => getColor(sectionCount.value - 1));
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
    padding: 6vh 5vw;
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
    margin-bottom: calc(6vh + 65px);
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
    height: 100px;
    z-index: 1;
}

.diagonal-separator svg {
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

@media (max-width:1024px) {
    .section-wrapper {
        padding: 5vh 0;
    }
}
</style>
