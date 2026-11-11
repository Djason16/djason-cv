<template>
    <!-- Header of a section: a small label above a large serif title on the left, a short text on the right, a thin rule under them -->
    <!-- One reveal for the whole header, the animation of its section (reveal.css): its parts one after the other -->
    <header v-reveal="reveal" class="section-head">
        <div class="section-head__main">
            <p class="eyebrow">{{ label }}</p>
            <h2 :id="id" class="section-head__title text-display-l">{{ title }}</h2>
        </div>
        <p v-if="text" class="section-head__text text-body">{{ text }}</p>
    </header>
</template>

<script setup lang="ts">
defineProps({
    // id of the title (aria-labelledby of the section)
    id: { type: String, required: true },
    label: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, default: '' },
    // Animation of the header, like its section: 'group' (rise), 'zoom-group', 'line', 'split', 'drop'
    reveal: { type: String, default: 'group' },
})
</script>
