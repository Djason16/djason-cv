<!-- Each component of "sections" in its own <section>, in order (style: assets/css/components/section-layout.css);
each section reveals its own content with v-reveal (plugins/reveal.js) -->
<template>
    <div class="sections-container">
        <section v-for="(section, index) in sections" :key="index" class="section-wrapper">
            <div class="content">
                <component :is="section" />
            </div>
        </section>
    </div>
</template>

<script setup>
defineProps({
    sections: { type: Array, required: true },
})
</script>
