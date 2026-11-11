<template>
    <!-- One category of tools: number and name, title and text on one line; then one card per tool (code, name),
         its description under it, in the card grid of the site (card-grid.css) -->
    <div class="skills-group">
        <div v-reveal="'group'" class="skills-group__head">
            <p class="eyebrow">{{ padIndex(number - 1) }} · {{ title }}</p>
            <h3 class="skills-group__title text-display-m">{{ title }}</h3>
            <p class="skills-group__text text-body">{{ text }}</p>
        </div>

        <ul class="card-grid">
            <li v-for="(skill, i) in skills" :key="skill.name" v-reveal class="skills-card"
                :style="{ '--reveal-delay': `calc(var(--reveal-stagger) * ${i % 6})` }">
                <div class="grid-card">
                    <span class="grid-card__code eyebrow">{{ padIndex(i, code) }}</span>
                    <h4 class="grid-card__name text-display-xs">{{ skill.name }}</h4>
                </div>
                <p class="skills-card__text text-body-s">{{ skill.description ?? t(skill.descriptionKey) }}</p>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { padIndex } from '@/utils/display'
import { useLang } from '@/composables/useLang'

const { getTranslation: t } = useLang()

defineProps({
    number: { type: Number, required: true },
    // Prefix of the codes of the cards (FE-01...)
    code: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    // { name, descriptionKey } (data/skills.js) or { name, description } (added from the admin)
    skills: { type: Array as PropType<Record<string, any>[]>, required: true },
})
</script>
