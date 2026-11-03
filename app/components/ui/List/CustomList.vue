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

<script setup>
import { padIndex } from '@/utils/display.js'
import { useLang } from '@/composables/useLang.js'
import { linkify } from '@/utils/text.js'

const lang = useLang()
const { getTranslation: t } = lang
// Texts with clickable emails, phone numbers and links (utils/text.js)
const processText = (txt, vars) => linkify(txt, vars, lang.getTranslation)
// "4. Title" -> "Title": the list already numbers its items
const withoutNumber = txt => String(txt ?? '').replace(/^\s*\d+\s*[.)-]\s*/, '')

defineProps({
    // { titleKey, contentKey, dynamicData? }
    items: { type: Array, default: () => [] },
    titleTag: { type: String, default: 'h2' },
    dynamicData: { type: Object, default: () => ({}) },
})
</script>
