<template>
    <!-- Slides of the carousel, moved with a transition -->
    <div class="carousel-track" :class="{ 'no-transition': !transitionEnabled }" :style="trackStyle">
        <!-- Loops through each slide -->
        <article v-for="(item, index) in slides" :key="`${index}-${item?.id}`" class="carousel-item" role="group"
            aria-roledescription="slide" :aria-label="`${getRealIndex(index) + 1} / ${itemsLength}`">
            <!-- Only render if item exists -->
            <template v-if="item && item.name">
                <!-- Default slot content for slide -->
                <slot :item="item">
                    <div class="carousel-content">
                        <div class="carousel-overlay">
                            <!-- Slide title -->
                            <h3 class="project-title text-xlarge">{{ item.name }}</h3>

                            <!-- Short description -->
                            <p class="project-description text-normal">{{ item.short }}</p>

                            <!-- Skills list -->
                            <ul v-if="item.skills && item.skills.length > 0" class="project-skills">
                                <li v-for="(skill, i) in item.skills" :key="i" class="skill text-normal">
                                    {{ t(skill) }}
                                </li>
                            </ul>

                            <!-- Optional external link -->
                            <a v-if="item.link" :href="item.link" target="_blank" rel="noopener noreferrer"
                                :title="`${item.name} - ${t('viewMore')}`"
                                class="project-link text-normal text-bold">
                                {{ t('viewMore') }}
                            </a>
                        </div>

                        <!-- API image served directly (dynamic, no NuxtImg) -->
                        <img v-if="item.img?.startsWith('api/')" :src="item.img"
                            :alt="itemAlt(item)" class="carousel-image" loading="lazy" width="640" height="480" />

                        <!-- Static image via NuxtImg -->
                        <NuxtImg v-else-if="item.img" :src="item.img" :alt="itemAlt(item)"
                            class="carousel-image" width="640" height="480" loading="lazy" />
                    </div>
                </slot>
            </template>
        </article>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

const props = defineProps({
    slides: { type: Array, default: () => [] },
    trackStyle: Object,
    transitionEnabled: Boolean,
    activeIndex: { type: Number, default: 0 },
    itemsLength: { type: Number, default: 0 }
})

// Index of a slide in the project list: the track has a copy of the last project first and of the first project last (infinite loop)
const getRealIndex = index => {
    if (props.itemsLength <= 1) return index
    if (index === 0) return props.itemsLength - 1
    if (index === props.slides.length - 1) return 0
    return index - 1
}

// Alternative text of a project image: name and short description
const itemAlt = item => {
    if (!item?.name && !item?.short) return ''
    if (item?.short) return `${item.name} — ${item.short}`
    return item.name
}
</script>
