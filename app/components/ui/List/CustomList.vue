<template>
    <!-- Titles and texts of a page (translation keys), with clickable emails, phone numbers and links -->
    <div class="custom-list">
        <!-- Animates each list item with slide-in effect -->
        <SlideInFromRight v-for="(item, i) in items" :key="i">
            <div class="custom-list__item">
                <!-- Dynamic title tag with styling and processed content -->
                <component :is="titleTag" :class="['custom-list__title', titleClass]" :style="{ color: titleColor }">
                    <span
                        v-html="processText(t(item.titleKey, item.dynamicData || dynamicData), item.dynamicData || dynamicData)"></span>
                </component>

                <!-- Content paragraph with dynamic text and color -->
                <p :class="contentClass" :style="{ color: contentColor }" class="custom-list__content">
                    <span
                        v-html="processText(t(item.contentKey, item.dynamicData || dynamicData), item.dynamicData || dynamicData)"></span>
                </p>
            </div>
        </SlideInFromRight>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import SlideInFromRight from '@/components/ui/Animation/SlideInFromRight.vue'
import { linkify } from '@/utils/text.js'

const lang = useLang()
const { getTranslation: t } = lang
// Texts with clickable emails, phone numbers and links (utils/text.js)
const processText = (txt, vars) => linkify(txt, vars, lang.getTranslation)

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
