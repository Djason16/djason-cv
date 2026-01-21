<template>
    <div id="hero-banner" class="hero-banner" role="banner" :aria-labelledby="'hero-banner__title'">
        <div class="hero-banner__content">
            <!-- Availability status + optional message -->
            <div class="availability-wrapper">
                <AvailabilityButton :status="currentAvailability" />
                <span v-if="showAvailabilityMessage" class="availability-schedule text-normal">
                    {{ availabilityMessage }}
                </span>
            </div>

            <!-- Main hero title -->
            <h1 id="hero-banner__title" class="hero-banner__title text-uppercase text-bold">
                {{ $lang.getTranslation('welcomeToMyWebsite') }}
            </h1>

            <!-- Primary contact buttons -->
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
import { useNuxtApp, useRuntimeConfig } from '#app'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import AvailabilityButton from '~/components/ui/Button/AvailabilityButton.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import { useCalendar } from '~/composables/useCalendar'
import { useUnavailability } from '~/composables/useUnavailability'
import { getAvailability, getWorkingHours } from '~/utils/availability'

const { $lang } = useNuxtApp()
const config = useRuntimeConfig()

// Composables
const { periods, override, fetchAll: fetchAvailability } = useUnavailability()
const { settings, fetchSettings } = useCalendar()

// Contact placeholders for ARIA and labels
const contactArgs = { email: config.public.contactEmail, phone: config.public.contactPhone }

// Hero actions (email & phone)
const heroActions = [
    { labelKey: 'sendEmailButton', ariaKey: 'sendEmail', href: `mailto:${config.public.contactEmail}`, icon: 'fas fa-envelope' },
    { labelKey: 'callPhoneButton', ariaKey: 'callPhone', href: `tel:${config.public.contactPhone.replace(/\s+/g, '')}`, icon: 'fas fa-phone' }
]

// Reactive availability state
const currentAvailability = ref('unavailable')
const availabilityMessage = ref('')
const dataLoaded = ref(false)
const showAvailabilityMessage = computed(() => {
    return !override.value?.enabled && Boolean(availabilityMessage.value)
})

// Update availability & generate message based on periods, override, and settings
const updateAvailability = () => {
    if (!dataLoaded.value) return
    const locale = $lang.current.value === 'french' ? 'fr-FR' : 'en-US'
    currentAvailability.value = getAvailability(periods.value, override.value, settings.value)
    availabilityMessage.value = getWorkingHours($lang.getTranslation, periods.value, override.value, settings.value, locale)

    console.log('Availability Update:', {
        status: currentAvailability.value,
        message: availabilityMessage.value,
        periods: periods.value,
        override: override.value,
        settings: settings.value,
        locale
    })
}

// Fetch data on mount and refresh every minute
onMounted(() => {
    let intervalId
    onUnmounted(() => intervalId && clearInterval(intervalId))

    const fetchData = async () => {
        try {
            await Promise.all([fetchAvailability(), fetchSettings()])
            dataLoaded.value = true
            updateAvailability()
            intervalId = setInterval(updateAvailability, 60000)
        } catch (err) {
            console.error('Failed to fetch initial data:', err)
        }
    }
    fetchData()
})

// React to changes in unavailability periods, overrides, settings, or language
watch([periods, override, settings, () => $lang.current.value], updateAvailability, { deep: true })
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