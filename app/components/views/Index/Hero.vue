<template>
    <!-- Hero banner section -->
    <div id="hero-banner" class="hero-banner" aria-labelledby="hero-banner__title" role="banner">
        <div class="hero-banner__content">
            <AvailabilityButton :status="personalInfo.availability" />

            <!-- Hero banner title -->
            <h1 id="hero-banner__title" class="hero-banner__title text-uppercase text-bold">
                {{ $lang.getTranslation('welcomeToMyWebsite') }}
            </h1>

            <!-- Hero banner action buttons -->
            <div class="hero-banner__actions">
                <!-- Loop through the heroActions array to generate each HeroButton -->
                <HeroButton v-for="(action, index) in heroActions" :key="index"
                    :label="$lang.getTranslation(action.labelKey)" :href="action.href" :ariaLabel="action.aria"
                    :iconClass="action.icon" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { personalInfo } from "../../../utils/personalInfo.js";
import AvailabilityButton from "../../ui/Button/AvailabilityButton.vue";
import HeroButton from "../../ui/Button/HeroButton.vue";

// Array of action button data
const heroActions = [
    {
        labelKey: 'sendEmail',
        href: `mailto:${personalInfo.email}`,
        aria: `Send an email to ${personalInfo.email}`,
        icon: 'fas fa-envelope',
    },
    {
        labelKey: 'callMe',
        href: `tel:${personalInfo.phone.replace(/\s+/g, '')}`,
        aria: `Call ${personalInfo.phone}`,
        icon: 'fas fa-phone',
    },
];
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