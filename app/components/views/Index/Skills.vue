<template>
    <!-- Skills section container with an event to handle clicks outside expanded items -->
    <section id="skills" class="skills-section" @click="handleOutsideClick">
        <div class="skills-section__content">
            <!-- Section title for skills -->
            <h2 class="skills-section__title text-tall text-uppercase">
                {{ $lang.getTranslation('skillsTitle') }}
            </h2>
            <!-- Section description for skills -->
            <div class="skills-section__description text-normal">
                {{ $lang.getTranslation('skillsDescription') }}
            </div>
        </div>

        <!-- Grid layout to display skills groups -->
        <div class="skills-section__grid">
            <!-- Render each skills group using SkillsGrid component -->
            <SkillsGrid v-for="(skillsGroup, index) in skillGroups" :key="index" :skills="skillsGroup.data"
                :gridClass="skillsGroup.class"
                :expandedSkill="expandedSkill.group === index ? expandedSkill.index : null"
                @toggleExpand="handleToggleExpand(index, $event)" />
        </div>
    </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue"; // Vue 3 composition API
import SkillsGrid from '~/components/ui/Grid/SkillsGrid.vue'; // Skills grid component
import { developerSkills, videoEditorSkills } from '../../../src/data/skillsData.js'; // Skills data

// Define skill groups with their respective data and styles
const skillGroups = [
    { data: videoEditorSkills, class: "video" }, // Video editing skills group
    { data: developerSkills, class: "dev" }, // Developer skills group
];

// Store the currently expanded skill (group index and skill index)
const expandedSkill = ref({ group: null, index: null });

/**
 * Toggle the expanded state of a skill.
 * If the skill is already expanded, collapse it.
 * Otherwise, set it as the currently expanded skill.
 * @param {number} groupIndex - Index of the skills group
 * @param {number} skillIndex - Index of the skill in the group
 */
function handleToggleExpand(groupIndex, skillIndex) {
    if (expandedSkill.value.group === groupIndex && expandedSkill.value.index === skillIndex) {
        expandedSkill.value = { group: null, index: null }; // Collapse the skill
    } else {
        expandedSkill.value = { group: groupIndex, index: skillIndex }; // Expand the skill
    }
}

/**
 * Handle clicks outside expanded elements.
 * Collapse the expanded skill if the click occurs outside the expanded element.
 * @param {Event} event - Click event
 */
function handleOutsideClick(event) {
    const expandedElement = document.querySelector(".skills-item.expanded");
    if (expandedElement && !expandedElement.contains(event.target)) {
        expandedSkill.value = { group: null, index: null }; // Reset expanded state
    }
}

// Add an event listener for clicks when the component is mounted
onMounted(() => {
    document.addEventListener("click", handleOutsideClick);
});

// Remove the event listener when the component is unmounted
onUnmounted(() => {
    document.removeEventListener("click", handleOutsideClick);
});
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