<template>
    <!-- Fullscreen loader with spinner and translated text -->
    <div class="loader-wrapper">
        <div class="spinner"></div> <!-- Spinning visual feedback -->
        <p class="loader-text text-large">{{ $lang.getTranslation('loading') }}</p> <!-- Localized loading message -->
    </div>
</template>

<script setup>
// Access Nuxt's language utility for translations
const { $lang } = useNuxtApp()
</script>

<style scoped>
.loader-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--fifth-color);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.3s ease;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--first-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

.loader-text {
    margin-top: 1rem;
    color: var(--text-color-light);
    font-size: 1.2rem;
    letter-spacing: 0.05em;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
