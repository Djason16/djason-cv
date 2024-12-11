<template>
    <!-- Hero banner section -->
    <div id="hero-banner" class="hero-banner" aria-labelledby="hero-banner__title" role="banner">
        <div class="hero-banner__content">
            <AvailabilityButton status="available" />
            <!-- Hero banner title -->
            <h1 id="hero-banner__title" class="hero-banner__title text-uppercase text-bold">
                {{ $lang.getTranslation('welcomeToMyWebsite') }}
            </h1>
            <!-- Hero banner action buttons -->
            <div class="hero-banner__actions">
                <!-- Button to send an email -->
                <HeroButton :label="$lang.getTranslation('sendEmail')" :href="`mailto:${personalInfo.email}`"
                    :ariaLabel="`Send an email to ${personalInfo.email}`" iconClass="fas fa-envelope" />
                    
                <!-- Button to make a phone call -->
                <HeroButton :label="$lang.getTranslation('callMe')"
                    :href="`tel:${personalInfo.phone.replace(/\s+/g, '')}`" :ariaLabel="`Call ${personalInfo.phone}`"
                    iconClass="fas fa-phone" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { personalInfo } from "../../../utils/personalInfo.js"; // Personal information
import AvailabilityButton from "../../ui/Button/AvailabilityButton.vue"; // Availability button component
import HeroButton from "../../ui/Button/HeroButton.vue"; // Hero button component
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