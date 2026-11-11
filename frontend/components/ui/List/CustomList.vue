<!-- Titles and texts of a page (translation keys), numbered, with clickable emails, phone numbers and links -->
<template>
    <ol class="custom-list">
        <li v-for="(item, i) in items" :key="item.titleKey" v-reveal class="custom-list__item">
            <div class="custom-list__head">
                <span class="custom-list__number eyebrow">{{ padIndex(i) }}</span>
                <component :is="titleTag" class="custom-list__title text-display-s">
                    <span v-html="processText(withoutNumber(t(item.titleKey, item.dynamicData || dynamicData)), item.dynamicData || dynamicData)"></span>
                </component>
            </div>

            <p class="custom-list__content text-body">
                <span v-html="processText(t(item.contentKey, item.dynamicData || dynamicData), item.dynamicData || dynamicData)"></span>
            </p>
        </li>
    </ol>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { padIndex } from '@/utils/display'
import { useLang } from '@/composables/useLang'
import { linkify } from '@/utils/text'

const lang = useLang()
const { getTranslation: t } = lang
// Texts with clickable emails, phone numbers and links (utils/text.js)
const processText = (txt: string, vars?: Record<string, string>) => linkify(txt, vars, lang.getTranslation)
// "4. Title" -> "Title": the list already numbers its items
const withoutNumber = (txt: unknown) => String(txt ?? '').replace(/^\s*\d+\s*[.)-]\s*/, '')

defineProps({
    // { titleKey, contentKey, dynamicData? }
    items: { type: Array as PropType<Record<string, any>[]>, default: () => [] },
    titleTag: { type: String, default: 'h2' },
    dynamicData: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
})
</script>
