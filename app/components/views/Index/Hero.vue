<template>
    <div id="hero-banner" class="hero-banner" aria-labelledby="hero-banner__title" role="banner">
        <div class="hero-banner__content">
            <!-- Availability indicator with conditional message -->
            <div class="availability-wrapper">
                <AvailabilityButton :status="currentAvailability" />
                <div class="text-normal" v-if="showAvailabilityMessage">
                    <span class="availability-schedule">{{ availabilityMessage }}</span>
                </div>
            </div>

            <!-- Hero title -->
            <h1 id="hero-banner__title" class="hero-banner__title text-uppercase text-bold">
                {{ $lang.getTranslation('welcomeToMyWebsite') }}
            </h1>

            <!-- Action buttons -->
            <div class="hero-banner__actions">
                <HeroButton v-for="(action, i) in heroActions" :key="i" :label="$lang.getTranslation(action.labelKey)"
                    :href="action.href" :ariaLabel="action.aria" :iconClass="action.icon" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AvailabilityButton from '~/components/ui/Button/AvailabilityButton.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import { getAvailability, getWorkingHours } from '~/utils/availability.js'
import { personalInfo } from '~/utils/personalInfo.js'

const { $lang } = useNuxtApp()

// Action buttons for email and phone
const heroActions = [
    { labelKey: 'sendEmail', href: `mailto:${personalInfo.email}`, aria: `Send an email to ${personalInfo.email}`, icon: 'fas fa-envelope' },
    { labelKey: 'callMe', href: `tel:${personalInfo.phone.replace(/\s+/g, '')}`, aria: `Call ${personalInfo.phone}`, icon: 'fas fa-phone' }
]

// Reactive availability state
const currentAvailability = ref(getAvailability())

// Compute availability message based on manual override or schedule
const availabilityMessage = computed(() => {
    if (personalInfo.manualOverride) {
        if (personalInfo.manualStatus === 'busy') return $lang.getTranslation('currentlyBusy')
        if (personalInfo.manualStatus === 'unavailable') return $lang.getTranslation('notAvailable')
        return '' // manualStatus === 'available' → no message
    }
    return getWorkingHours($lang.getTranslation) // normal working hours
})

// Show message only if non-empty
const showAvailabilityMessage = computed(() => !!availabilityMessage.value)

// Auto-refresh availability every minute
let intervalId
onMounted(() => {
    intervalId && clearInterval(intervalId)
    intervalId = setInterval(() => currentAvailability.value = getAvailability(), 60000)
})
onUnmounted(() => intervalId && clearInterval(intervalId))

// Refresh availability on language change
watch(() => $lang.current.value, () => currentAvailability.value = getAvailability())
</script>

<style scoped>
.hero-banner {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    min-height: 60vh;
    position: relative;
}

.hero-banner__content {
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
    margin-top: 20px;
}

.availability-wrapper {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    gap: .5rem;
    margin-bottom: 1rem;
}

.availability-schedule {
    color: var(--text-color-light);
}
</style>