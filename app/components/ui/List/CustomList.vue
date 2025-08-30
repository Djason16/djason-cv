<template>
    <!-- Custom list with slide-in animation for each item -->
    <div class="custom-list">
        <SlideInFromRight v-for="(item, i) in items" :key="i">
            <div class="custom-list__item">
                <!-- Dynamic title tag with styling and color -->
                <component :is="titleTag" :class="['custom-list__title', titleClass]" :style="{ color: titleColor }">
                    {{ $lang.getTranslation(item.titleKey, dynamicData) }}
                </component>

                <!-- List item content with dynamic styling and translations -->
                <p :class="contentClass" :style="{ color: contentColor }" class="custom-list__content">
                    {{ $lang.getTranslation(item.contentKey, dynamicData) }}
                </p>
            </div>
        </SlideInFromRight>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'

// Access Nuxt language plugin for translations
const { $lang } = useNuxtApp()

// Props: list data, dynamic styling, and optional dynamic variables
defineProps({
    items: { type: Array, default: () => [] },
    titleTag: { type: String, default: 'h3' },
    titleClass: { type: String, default: 'text-large text-bold' },
    titleColor: { type: String, default: 'var(--third-color)' },
    contentClass: { type: String, default: 'text-normal' },
    contentColor: { type: String, default: 'var(--text-color-grey)' },
    dynamicData: { type: Object, default: () => ({}) }
})
</script>

<style scoped>
.custom-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.custom-list__item {
    border-left: 4px solid var(--fourth-color);
    padding-left: 1rem;
}

.custom-list__title {
    margin: 0;
    font-weight: bold;
}

.custom-list__content {
    margin: 0.5rem 0;
    line-height: 1.6;
}
</style>
