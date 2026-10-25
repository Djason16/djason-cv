<template>
    <!-- Grid of one group of skills, a click on a skill shows its details -->
    <div class="skills-grid-container">
        <ul :class="`skills-grid--${gridClass} skills-grid`" role="list">
            <li v-for="(skill, i) in skills" :key="i" :class="['skills-item', { expanded: expandedSkill === i }]">
                <button type="button" class="skills-item__button"
                    :aria-expanded="expandedSkill === i ? 'true' : 'false'"
                    :aria-label="`${skill.name} - ${t(skill.descriptionKey)}`"
                    @click.stop="toggleExpand(i)">
                    <img :src="skill.svg" alt="" class="skills-item__icon" loading="lazy" />

                    <!-- Skill icon -->
                    <div class="skills-item__content">
                        <h3 class="skills-item__title text-smaller text-bold">{{ skill.name }}</h3>
                        <p v-if="expandedSkill === i" class="skills-item__description text-tiny">
                            {{ t(skill.descriptionKey) }}
                        </p>
                    </div>
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()
defineProps({
    skills: { type: Array, required: true },
    gridClass: { type: String, required: true },
    expandedSkill: { type: Number, default: undefined }
})

const emit = defineEmits(['toggleExpand'])
// Index of the clicked skill, the parent opens or closes it
const toggleExpand = i => emit('toggleExpand', i)
</script>
