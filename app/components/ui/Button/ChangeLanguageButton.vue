<template>
    <!-- Language switcher buttons to toggle between French and English -->
    <div class="language-switcher">
        <!-- French language button: 'active' class is added if the current language is French -->
        <button :class="{ active: currentLanguage === 'french' }" @click="switchLanguage('french')">
            FR
        </button>
        <!-- English language button: 'active' class is added if the current language is English -->
        <button :class="{ active: currentLanguage === 'english' }" @click="switchLanguage('english')">
            EN
        </button>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'; // Import the useNuxtApp function to access Nuxt app context

// Current language context
const { $lang } = useNuxtApp();

// Current language state (either 'french' or 'english')
const currentLanguage = $lang.current;

// Function to switch the language
const switchLanguage = (lang) => {
    // Set the new language in $lang
    $lang.setLang(lang);
    // Store the selected language in localStorage to persist language preference across page reloads
    localStorage.setItem('selectedLanguage', lang);
};
</script>

<style scoped>
.language-switcher {
    position: fixed;
    bottom: 1.5rem;
    right: calc((100vw - 90vw) / 5 - 0.875rem);
    display: flex;
    flex-direction: column;
    background-color: var(--third-color);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    z-index: 10;
    opacity: 0.8;
    transition: opacity 0.3s ease;
}

.language-switcher:hover {
    opacity: 1;
}

.language-switcher button {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.3s ease;
    color: var(--text-color-light);
}

.language-switcher button.active {
    background-color: var(--first-color);
    color: var(--text-color-dark);
}

@media (max-width: 1024px) {
    .language-switcher {
        right: 1.5rem;
        background-color: var(--fifth-color);
        opacity: .8;
    }

    .language-switcher:hover {
        opacity: .8;
    }
}
</style>
