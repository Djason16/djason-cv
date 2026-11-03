<template>
    <!--
        Image of the site: lazy loading by default, "priority" for an image seen at once (logo, top of page),
        and the default image when the file is missing (a project image deleted, a wrong address...).
        Classes and other attributes go on the <img>.
    -->
    <img ref="image" :src="current" :alt="alt" :title="title ?? (alt || undefined)" :width="width" :height="height" :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'" decoding="async" @error="useFallback" />
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
    src: { type: String, required: true },
    // Text read by screen readers and search engines; '' for a decorative image
    alt: { type: String, required: true },
    // Shown on hover; the alt by default (none for a decorative image)
    title: { type: String, default: undefined },
    width: { type: [Number, String], default: undefined },
    height: { type: [Number, String], default: undefined },
    // Loaded at once (logo, top of page, PDF documents) instead of when it gets close to the screen
    priority: { type: Boolean, default: false },
    // Shown when the image cannot be loaded; '' to show nothing instead
    fallback: { type: String, default: '/images/default_image.jpg' },
})

const current = ref(props.src)
watch(() => props.src, src => { current.value = src })

// Missing image: the default image, once (no loop if the default image is missing too)
const useFallback = () => {
    if (props.fallback && current.value !== props.fallback) current.value = props.fallback
}

// An image of the server page can fail before the browser takes over the page (no error event then): checked once
const image = ref(null)
onMounted(() => {
    if (image.value?.complete && image.value.naturalWidth === 0) useFallback()
})
</script>
