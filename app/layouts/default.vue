<template>
    <!-- Loader shown initially; main content renders after loading -->
    <Loader v-show="showLoader" />
    <div v-show="!showLoader">
        <BackToTop />
        <ChangeLanguageButton />
        <Header />
        <NuxtPage />
        <Footer />
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { onMounted, ref } from 'vue'
import Footer from '~/components/layout/Footer/Footer.vue'
import Header from '~/components/layout/Header/Header.vue'
import BackToTop from '~/components/ui/Button/BackToTop.vue'
import ChangeLanguageButton from '~/components/ui/Button/ChangeLanguageButton.vue'
import Loader from '~/components/ui/Loader/Loader.vue'

const { $lang } = useNuxtApp()
const showLoader = ref(true)

onMounted(async () => {
    // Restore previously selected language or set default
    const storedLang = localStorage.getItem('selectedLanguage')
    storedLang ? $lang.setLang(storedLang) : localStorage.setItem('selectedLanguage', $lang.current.value)

    // Determine if user has visited; control loader duration
    const alreadyVisited = localStorage.getItem('visited')
    await new Promise(r => setTimeout(r, 200))
    if (alreadyVisited) showLoader.value = false
    else {
        localStorage.setItem('visited', 'true')
        setTimeout(() => (showLoader.value = false), 2000)
    }
})
</script>

<style scoped></style>