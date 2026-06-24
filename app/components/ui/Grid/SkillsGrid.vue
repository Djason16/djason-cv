<template>
    <!-- Skills grid with dynamic modifier and expandable items -->
    <div class="skills-grid-container">
        <ul :class="`skills-grid--${gridClass} skills-grid`" role="list">
            <li v-for="(skill, i) in skills" :key="i" :class="['skills-item', { expanded: expandedSkill === i }]">
                <button type="button" class="skills-item__button"
                    :aria-expanded="expandedSkill === i ? 'true' : 'false'"
                    :aria-label="`${skill.name} - ${$lang.getTranslation(skill.descriptionKey)}`"
                    @click.stop="toggleExpand(i)">
                    <img :src="skill.svg" alt="" class="skills-item__icon" loading="lazy" />

                    <!-- Skill icon -->
                    <div class="skills-item__content">
                        <h3 class="skills-item__title text-smaller text-bold">{{ skill.name }}</h3>
                        <p v-if="expandedSkill === i" class="skills-item__description text-tiny">
                            {{ $lang.getTranslation(skill.descriptionKey) }}
                        </p>
                    </div>
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'

// Props: array of skills, grid class, optional expanded skill index
defineProps({
    skills: { type: Array, required: true },
    gridClass: { type: String, required: true },
    expandedSkill: { type: Number, default: undefined }
})

const { $lang } = useNuxtApp()

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
    list-style: none;
    padding: 0;
    margin: 0;
}

.skills-item {
    position: relative;
    aspect-ratio: 1;
    background: var(--first-color);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    z-index: 1;
    will-change: transform;
}

.skills-item__button {
    all: unset;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
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
    opacity: 0.15;
}

.skills-item__title {
    max-width: 100%;
    color: var(--text-color-dark);
    overflow-wrap: anywhere;
}

.skills-item__description {
    margin: 0.5rem 0 0;
    color: var(--text-color-dark);
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
    width: 85%;
}

.skills-item.expanded .skills-item__content {
    opacity: 1;
}

.skills-item__button:focus-visible {
    outline: 2px solid var(--fourth-color);
    outline-offset: -2px;
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

@media (max-width: 768px) {
    .skills-item__description {
        display: none;
    }
}
</style>