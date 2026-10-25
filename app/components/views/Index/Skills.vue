<template>
    <!-- Home page: skills section, one grid per group of skills -->
    <section id="skills" class="skills-section" aria-labelledby="skills-section__title">
        <div class="skills-section__content">
            <h2 id="skills-section__title" class="skills-section__title text-tall text-uppercase">
                {{ t('skillsTitle') }}
            </h2>

            <div class="skills-section__description text-normal">
                {{ t('skillsDescription') }}
            </div>
        </div>

        <!-- Renders each skills group as a grid -->
        <div class="skills-section__grid">
            <SkillsGrid v-for="(group, i) in skillGroups" :key="i" :skills="group.data" :gridClass="group.class"
                :expandedSkill="expandedSkill.group === i ? expandedSkill.index : null"
                @toggleExpand="handleToggleExpand(i, $event)" />
        </div>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { onMounted, onUnmounted, ref } from 'vue'
import SkillsGrid from '@/components/views/Index/SkillsGrid.vue'
import { developerSkills, videoEditorSkills } from '@/data/skills.js'

const { getTranslation: t } = useLang()

// Skill groups with data & style classes
const skillGroups = [
    { data: videoEditorSkills, class: 'video' },
    { data: developerSkills, class: 'dev' }
]

// Tracks expanded skill (group + index)
const expandedSkill = ref({ group: null, index: null })

// Toggles expansion; collapse if same skill clicked
const handleToggleExpand = (groupIndex, skillIndex) =>
    expandedSkill.value =
    expandedSkill.value.group === groupIndex && expandedSkill.value.index === skillIndex
        ? { group: null, index: null }
        : { group: groupIndex, index: skillIndex }

// Collapse expanded skill if click occurs outside
const handleOutsideClick = e => {
    const el = document.querySelector('.skills-item.expanded')
    if (el && !el.contains(e.target)) expandedSkill.value = { group: null, index: null }
}

// Adds/removes global click listener
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>
