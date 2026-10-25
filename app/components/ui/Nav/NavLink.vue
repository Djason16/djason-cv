<template>
    <!-- Link of the header that scrolls to a section of the home page -->
    <span class="header-top__link text-normal text-bold text-uppercase" @click="handleClick">
        <slot></slot>
    </span>
</template>

<script setup>
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'

// id of the section of the home page to scroll to
const props = defineProps({ id: { type: String, required: true } })
const router = useRouter()

// Goes to the home page if needed, then scrolls to the section
const handleClick = async () => {
    if (router.currentRoute.value.path !== '/') await router.push('/')
    // The sections of the home page are in the page once it is rendered
    await nextTick()
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
