<template>
    <!-- Home page: skills (data/skills.js and the ones added from the admin), one group per category: its header, then its tools as cards, one out of two set lower -->
    <!-- Every name of every group of tools the same size (--letters: the longest word of all of them, card-grid.css) -->
    <section id="skills" class="skills-section" aria-labelledby="skills-title" :style="{ '--letters': longestWord(groups.map(g => g.skills.map(s => s.name))) }">
        <SectionHead id="skills-title" :label="t('skillsLabel')" :title="t('skillsTitle')" :text="t('skillsDescription')" />

        <SkillsGrid v-for="(group, i) in groups" :key="group.id" :number="i + 1" :code="group.code"
            :title="t(group.labelKey)" :text="t(group.textKey)" :skills="group.skills" />
    </section>
</template>

<script setup lang="ts">
import SectionHead from '@/components/ui/SectionLayout/SectionHead.vue'
import { longestWord } from '@/utils/display'
import SkillsGrid from '@/components/views/Index/SkillsGrid.vue'
import { useLang } from '@/composables/useLang'
import { useSkills } from '@/composables/useSkills'

const { getTranslation: t } = useLang()
// The skills of data/skills.js and the ones added from the admin: in the HTML for search engines, then again in the browser
const { groups, fetchSkills } = useSkills()
await callOnce('skills', fetchSkills)
onMounted(fetchSkills)
</script>
