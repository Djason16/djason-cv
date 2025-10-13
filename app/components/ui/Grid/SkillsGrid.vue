<template>
    <!-- Skills grid with dynamic modifier and expandable items -->
    <div class="skills-grid-container">
        <div :class="`skills-grid--${gridClass} skills-grid`">
            <div v-for="(skill, i) in skills" :key="i" :class="['skills-item', { expanded: expandedSkill === i }]"
                @click.stop="toggleExpand(i)"> <!-- Toggle expansion on click -->
                <img :src="skill.svg" :alt="skill.name" :title="$lang.getTranslation(skill.descriptionKey)"
                    :aria-label="$lang.getTranslation(skill.descriptionKey)" class="skills-item__icon" loading="lazy" />
                <!-- Skill icon -->
                <div class="skills-item__content">
                    <h3 class="skills-item__title text-smaller text-bold">{{ skill.name }}</h3> <!-- Skill name -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
// Props: array of skills, grid class, optional expanded skill index
const props = defineProps({
    skills: { type: Array, required: true },
    gridClass: { type: String, required: true },
    expandedSkill: { type: Number, default: undefined }
})

// Emit function to notify parent of skill toggle
const emit = defineEmits(['toggleExpand'])
const toggleExpand = i => emit('toggleExpand', i) // Emit index when a skill is clicked
</script>

<style scoped>
.skills-grid-container {
    flex: 1;
    min-width: 300px;
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0.5rem;
    position: relative;
    transition: 0.3s ease;
}

.skills-item {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    aspect-ratio: 1;
    background: var(--first-color);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    z-index: 1;
    will-change: transform;
}

.skills-item.expanded {
    transform: scale(2);
    z-index: 2;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.25);
}

.skills-item__icon {
    width: 60%;
    height: 60%;
    object-fit: contain;
    transition: opacity 0.3s ease;
}

.skills-item.expanded .skills-item__icon {
    opacity: 0.2;
}

.skills-item__title {
    max-width: 100%;
    color: var(--text-color-dark);
    white-space: wrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.skills-item__content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 3;
}

.skills-item.expanded .skills-item__content {
    opacity: 1;
}

.skills-grid--dev,
.skills-grid--video {
    grid-template-areas:
        ".      item-2 item-3 item-4 ."
        "item-5 item-1 item-1 item-6 item-7"
        ".      item-8 item-9 item-10 .";
}

.skills-grid--dev .skills-item:nth-child(1),
.skills-grid--video .skills-item:nth-child(1) {
    grid-area: item-1;
}

.skills-grid--dev .skills-item:nth-child(2),
.skills-grid--video .skills-item:nth-child(2) {
    grid-area: item-2;
}

.skills-grid--dev .skills-item:nth-child(3),
.skills-grid--video .skills-item:nth-child(3) {
    grid-area: item-3;
}

.skills-grid--dev .skills-item:nth-child(4),
.skills-grid--video .skills-item:nth-child(4) {
    grid-area: item-4;
}

.skills-grid--dev .skills-item:nth-child(5),
.skills-grid--video .skills-item:nth-child(5) {
    grid-area: item-5;
}

.skills-grid--dev .skills-item:nth-child(6),
.skills-grid--video .skills-item:nth-child(6) {
    grid-area: item-6;
}

.skills-grid--dev .skills-item:nth-child(7),
.skills-grid--video .skills-item:nth-child(7) {
    grid-area: item-7;
}

.skills-grid--dev .skills-item:nth-child(8),
.skills-grid--video .skills-item:nth-child(8) {
    grid-area: item-8;
}

.skills-grid--dev .skills-item:nth-child(9),
.skills-grid--video .skills-item:nth-child(9) {
    grid-area: item-9;
}

.skills-grid--dev .skills-item:nth-child(10),
.skills-grid--video .skills-item:nth-child(10) {
    grid-area: item-10;
}
</style>