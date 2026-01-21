<template>
    <!-- Clickable link that scrolls to a target section -->
    <span class="header-top__link text-normal text-bold text-uppercase" @click="handleClick">
        <slot></slot>
    </span>
</template>

<script setup>
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'

// Prop: target section ID to scroll to
const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()

// Handle click: navigate home if needed, then scroll
const handleClick = async () => {
    if (router.currentRoute.value.path !== '/') await router.push('/') // go home if not already
    await nextTick() // wait for DOM to update
    scrollToSection()
}

// Smoothly scrolls to the target element, adjusting for header
const scrollToSection = () => {
    const el = document.getElementById(props.id)
    if (!el) return console.error(`Element with ID "${props.id}" not found.`)

    const header = document.querySelector('header')
    const headerHeight = header?.offsetHeight ?? 0
    const offset = header?.classList.contains('sticky') ? headerHeight + 20 : headerHeight * 2 + 20

    window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
    })
}
</script>

<style scoped>
.header-top__link {
    text-decoration: none;
    color: var(--text-color-light);
    transition: color 0.3s ease;
    cursor: pointer;
}

.header-top__link:hover {
    color: var(--fourth-color);
}

@media (max-width:1024px) {
    .header-top__link:hover {
        color: inherit;
    }
}
</style>