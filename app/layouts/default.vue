<template>
    <!-- Back-to-top button for quick navigation -->
    <BackToTop />
    <!-- Change language button for switching between languages -->
    <ChangeLanguageButton />
    <!-- Page header, typically includes navigation and branding -->
    <Header />
    <!-- Main content area for rendering the active Nuxt page -->
    <NuxtPage />
    <!-- Page footer, includes additional links and site information -->
    <Footer />
</template>

<script setup>
import BackToTop from "~/components/ui/Button/BackToTop.vue"; // Back to top button component
import ChangeLanguageButton from "~/components/ui/Button/ChangeLanguageButton.vue"; // Change language button component
import Footer from '../components/layout/Footer/Footer.vue'; // Footer component
import Header from '../components/layout/Header/Header.vue'; // Header component

// Current language context
const { $lang } = useNuxtApp();

/**
 * Set the language based on the user's previously selected preference stored in localStorage.
 * This ensures that the website displays the correct language upon revisit.
 */
onMounted(() => {
    const storedLang = localStorage.getItem('selectedLanguage');
    if (storedLang) {
        $lang.setLang(storedLang);
    }
});
</script>

<style scoped></style>