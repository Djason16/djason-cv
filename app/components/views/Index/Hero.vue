<template>
    <div id="hero-banner" class="hero-banner" role="banner" aria-labelledby="hero-banner__title">
        <div class="hero-banner__content">
            <!-- Availability status + optional contextual message -->
            <div class="availability-wrapper">
                <AvailabilityButton :status="currentAvailability" />
                <span v-if="showAvailabilityMessage" class="availability-schedule text-normal">
                    {{ availabilityMessage }}
                </span>
            </div>

            <!-- Main hero heading -->
            <h1 id="hero-banner__title" class="hero-banner__title text-uppercase text-bold">
                {{ $lang.getTranslation('welcomeToMyWebsite') }}
            </h1>

            <!-- Primary contact actions -->
            <div class="hero-banner__actions">
                <HeroButton v-for="(action, i) in heroActions" :key="i" :label="$lang.getTranslation(action.labelKey)"
                    :href="action.href" :iconClass="action.icon"
                    :ariaLabel="$lang.getTranslation(action.ariaKey, contactArgs)"
                    :title="$lang.getTranslation(action.ariaKey, contactArgs)" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AvailabilityButton from '~/components/ui/Button/AvailabilityButton.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import { getAvailability, getWorkingHours } from '~/utils/availability'
import { personalInfo } from '~/utils/personalInfo'

const { $lang } = useNuxtApp()

/* Static contact metadata reused across buttons */
const contactArgs = {
    email: personalInfo.email,
    phone: personalInfo.phone
}

/* Hero call-to-action configuration */
const heroActions = [
    {
        labelKey: 'sendEmailButton',
        ariaKey: 'sendEmail',
        href: `mailto:${personalInfo.email}`,
        icon: 'fas fa-envelope'
    },
    {
        labelKey: 'callPhoneButton',
        ariaKey: 'callPhone',
        href: `tel:${personalInfo.phone.replace(/\s+/g, '')}`,
        icon: 'fas fa-phone'
    }
]

/* Reactive availability state */
const currentAvailability = ref(getAvailability())

/* Human-readable availability message
   - Manual override has priority
   - Otherwise falls back to working hours
   - Language dependency is explicitly tracked */
const availabilityMessage = computed(() => {
    $lang.current.value // ensures recompute on language change

    if (personalInfo.manualOverride) {
        return personalInfo.manualStatus === 'busy'
            ? $lang.getTranslation('currentlyBusy')
            : personalInfo.manualStatus === 'unavailable'
                ? $lang.getTranslation('notAvailable')
                : ''
    }

    return getWorkingHours($lang.getTranslation)
})

/* Message visibility guard */
const showAvailabilityMessage = computed(() => Boolean(availabilityMessage.value))

/* Refresh availability every minute */
let intervalId
onMounted(() => {
    intervalId = setInterval(() => {
        currentAvailability.value = getAvailability()
    }, 60000)
})
onUnmounted(() => clearInterval(intervalId))

/* Sync availability on language switch */
watch(() => $lang.current.value, () => {
    currentAvailability.value = getAvailability()
})
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