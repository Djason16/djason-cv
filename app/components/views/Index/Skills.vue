<template>
    <!-- Skills section wrapper -->
    <section id="skills" class="skills-section">
        <div class="skills-section__content">
            <h2 class="skills-section__title text-tall text-uppercase">
                {{ $lang.getTranslation('skillsTitle') }}
            </h2>
            <div class="skills-section__description text-normal">
                {{ $lang.getTranslation('skillsDescription') }}
            </div>
        </div>

        <!-- Render each skills group as a grid -->
        <div class="skills-section__grid">
            <SkillsGrid v-for="(group, i) in skillGroups" :key="i" :skills="group.data" :gridClass="group.class"
                :expandedSkill="expandedSkill.group === i ? expandedSkill.index : null"
                @toggleExpand="handleToggleExpand(i, $event)" />
        </div>
    </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import SkillsGrid from '~/components/ui/Grid/SkillsGrid.vue'
import { useSkills } from '~/composables/useSkills.js'

const { developerSkills, videoEditorSkills } = useSkills()

// Skill groups with data & style classes
const skillGroups = [
    { data: videoEditorSkills, class: 'video' },
    { data: developerSkills, class: 'dev' }
]

// Track expanded skill (group + index)
const expandedSkill = ref({ group: null, index: null })

// Toggle expansion; collapse if same skill clicked
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

// Add/remove global click listener
onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<style scoped>
.skills-section {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
    max-width: 80%;
    margin: auto;
}

.skills-section__content {
    flex: 1;
    max-width: 100%;
    text-align: center;
}

.skills-section__title {
    margin: 0 0 1rem;
}

.skills-section__description {
    margin: 0;
    line-height: 1.5;
}

.skills-section__grid {
    flex: 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0;
    transition: all 0.3s ease;
}

@media (max-width: 1024px) {
    .skills-section {
        flex-direction: column;
    }

    .skills-section__content,
    .skills-section__grid {
        max-width: 100%;
    }

    .skills-section__grid {
        flex-direction: column;
        gap: .5rem;
    }

    .skills-section__title {
        margin: 0;
    }
}
</style>