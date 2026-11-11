<!-- Layout of the text pages (legal, login, admin, pay-me, error), in the style of the home page:
the name of the site as a label, a very large title, a short text, a thin rule, then the form or tools of the page
(slot custom-content) and the numbered text sections. Look: assets/css/components/page-layout.css -->
<template>
    <div class="page-layout">
        <div class="page-layout__inner">
            <header v-reveal="'group'" class="page-layout__head">
                <p class="eyebrow">{{ site.name }}</p>
                <h1 class="page-layout__title text-display-l">
                    <span v-html="processText(t(pageTitleKey, dynamicData), dynamicData)"></span>
                </h1>
                <p class="page-layout__subtitle text-body-l">
                    <span v-html="processText(t(pageSubtitleKey, dynamicData), dynamicData)"></span>
                </p>
            </header>

            <!-- Form, buttons or tools of the page, before its texts -->
            <div v-if="$slots['custom-content']" class="page-layout__panel">
                <slot name="custom-content" />
            </div>

            <CustomList :items="sections" :titleTag="titleTag" :dynamicData="dynamicData" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'
import { linkify } from '@/utils/text'
import CustomList from '../List/CustomList.vue'

const lang = useLang()
const { getTranslation: t } = lang
const site = useSite()

// Texts with clickable emails, phone numbers and links (utils/text.js)
const processText = (txt: string, vars?: Record<string, string>) => linkify(txt, vars, lang.getTranslation)

defineProps({
    pageTitleKey: { type: String, required: true },
    pageSubtitleKey: { type: String, required: true },
    sections: { type: Array as PropType<Record<string, any>[]>, required: true },
    // Tag of the section titles (h2 under the h1 of the page)
    titleTag: { type: String, default: 'h2' },
    dynamicData: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
})
</script>
