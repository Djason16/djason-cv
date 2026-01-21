<template>
    <div class="custom-list">
        <!-- Animate each list item with slide-in effect -->
        <SlideInFromRight v-for="(item, i) in items" :key="i">
            <div class="custom-list__item">
                <!-- Dynamic title tag with styling and processed content -->
                <component :is="titleTag" :class="['custom-list__title', titleClass]" :style="{ color: titleColor }">
                    <span
                        v-html="processText($lang.getTranslation(item.titleKey, item.dynamicData || dynamicData), item.dynamicData || dynamicData)"></span>
                </component>

                <!-- Content paragraph with dynamic text and color -->
                <p :class="contentClass" :style="{ color: contentColor }" class="custom-list__content">
                    <span
                        v-html="processText($lang.getTranslation(item.contentKey, item.dynamicData || dynamicData), item.dynamicData || dynamicData)"></span>
                </p>
            </div>
        </SlideInFromRight>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import { useTextEscape } from '~/composables/useTextEscape'

const { $lang } = useNuxtApp()
const { processText } = useTextEscape($lang)

// Props for list data, dynamic styling, and optional variable substitutions
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