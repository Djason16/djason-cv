<template>
    <!-- Hero banner container -->
    <div id="hero-banner" class="hero-banner" aria-labelledby="hero-banner__title" role="banner">
        <div class="hero-banner__content">
            <!-- Availability status indicator -->
            <AvailabilityButton :status="personalInfo.availability" />

            <!-- Main hero title -->
            <h1 id="hero-banner__title" class="hero-banner__title text-uppercase text-bold">
                {{ $lang.getTranslation('welcomeToMyWebsite') }}
            </h1>

            <!-- Action buttons (email, phone) -->
            <div class="hero-banner__actions">
                <HeroButton v-for="(action, i) in heroActions" :key="i" :label="$lang.getTranslation(action.labelKey)"
                    :href="action.href" :ariaLabel="action.aria" :iconClass="action.icon" />
            </div>
        </div>
    </div>
</template>

<script setup>
import AvailabilityButton from '~/components/ui/Button/AvailabilityButton.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import { personalInfo } from '~/utils/personalInfo.js'

// Define hero action buttons with dynamic hrefs and icons
const heroActions = [
    { labelKey: 'sendEmail', href: `mailto:${personalInfo.email}`, aria: `Send an email to ${personalInfo.email}`, icon: 'fas fa-envelope' },
    { labelKey: 'callMe', href: `tel:${personalInfo.phone.replace(/\s+/g, '')}`, aria: `Call ${personalInfo.phone}`, icon: 'fas fa-phone' },
]
</script>

<style scoped>
.hero-banner {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: auto;
    min-height: 60vh;
    overflow: hidden;
}

.hero-banner__content {
    position: relative;
    z-index: 2;
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 80%;
}

.hero-banner__actions {
    display: flex;
    gap: 20px;
    justify-content: flex-start;
    margin-top: 20px;
}
</style>