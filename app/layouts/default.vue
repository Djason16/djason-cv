<template>
    <div>
        <!-- Loader component to show loading state -->
        <Loader v-show="showLoader" />
        <div v-show="!showLoader">
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
        </div>
    </div>
</template>

<script setup>
import BackToTop from "~/components/ui/Button/BackToTop.vue"; // Back to top button component
import ChangeLanguageButton from "~/components/ui/Button/ChangeLanguageButton.vue"; // Change language button component
import Footer from '../components/layout/Footer/Footer.vue'; // Footer component
import Header from '../components/layout/Header/Header.vue'; // Header component
import Loader from '../components/ui/Loader/Loader.vue'; // Loader component for displaying loading state

// Current language context
const { $lang } = useNuxtApp();

// Reactive state to control the visibility of the loader
const showLoader = ref(true);

/**
 * Set the language based on the user's previously selected preference stored in localStorage.
 *  If no preference is found, it defaults to the current language.
 * Additionally, it manages the visibility of the loader based on whether the user has visited the site before.
 */
onMounted(async () => {

    const storedLang = localStorage.getItem('selectedLanguage');
    if (storedLang) {
        $lang.setLang(storedLang);
    } else {
        localStorage.setItem('selectedLanguage', $lang.current.value);
    }

    const alreadyVisited = localStorage.getItem('visited');
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (alreadyVisited) {
        showLoader.value = false;
    } else {
        localStorage.setItem('visited', 'true');
        setTimeout(() => {
            showLoader.value = false;
        }, 2000);
    }
});
</script>

<style scoped></style>