<template>
    <!-- Link of the header to a section of the home page (a real link: keyboard and search engines), highlighted while it is on screen -->
    <a :href="`/#${id}`" class="header-top__link text-label" :class="{ 'is-active': active }"
        :aria-current="active ? 'true' : undefined" @click.prevent="handleClick">
        <slot></slot>
    </a>
</template>

<script setup>
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { scrollToSection } from '@/utils/scroll.js'

const props = defineProps({
    // id of the section of the home page
    id: { type: String, required: true },
    // true while the section is on screen
    active: { type: Boolean, default: false },
})
const router = useRouter()

// Goes to the home page if needed, then scrolls to the section (in the page once it is rendered)
const handleClick = async () => {
    if (router.currentRoute.value.path !== '/') await router.push('/')
    await nextTick()
    scrollToSection(props.id)
}
</script>
