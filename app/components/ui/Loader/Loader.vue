<template>
    <!-- Fullscreen loader that shows while the page is loading -->
    <div class="loader-wrapper">
        <!-- Spinning animation for visual feedback -->
        <div class="spinner"></div>
        <!-- Loading text, translated based on the current language -->
        <p class="loader-text text-large">
            {{ $lang.getTranslation('loading') }}
        </p>
    </div>
</template>

<script setup>
// Access the language utility from the Nuxt app
const { $lang } = useNuxtApp();
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
