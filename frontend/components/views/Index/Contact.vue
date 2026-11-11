<template>
    <!--
        Home page: contact, the closing of the page. A very large title, the email as a giant link,
        a line with the phone, the city and the button, then the week as seven columns (today in mint).
    -->
    <section id="contact" class="contact-section" aria-labelledby="contact-title">
        <!-- Its own animation: the header drops from above, the email comes from the left, the details and the week drop one after the other -->
        <header v-reveal="'drop'" class="contact-section__head">
            <p class="eyebrow">{{ t('contactLabel') }}</p>
            <h2 id="contact-title" class="contact-section__title text-display-l">{{ t('contactTitle') }}</h2>
        </header>

        <!-- The email, very large: its line draws on hover, the arrow turns -->
        <a v-if="site.email" v-reveal="'from-left'" :href="`mailto:${site.email}`" class="contact-section__email text-display-m text-lowercase"
            :title="t('sendEmail', { email: site.email })">
            <span>{{ site.email }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M6 18L18 6M8 6h10v10" /></svg>
        </a>

        <div v-reveal="'drop'" class="contact-section__row">
            <div v-if="site.phone" class="contact-section__item text-body-l">
                <span class="eyebrow">{{ t('phoneNumber') }}</span>
                <a :href="`tel:${site.phone.replace(/\s+/g, '')}`" :title="t('callPhone', { phone: site.phone })">{{ site.phone }}</a>
            </div>
            <div v-if="site.area" class="contact-section__item text-body-l">
                <span class="eyebrow">{{ t('aboutLocationLabel') }}</span>
                <span>{{ site.area }}</span>
            </div>
            <a v-if="site.email" :href="`mailto:${site.email}`" :title="t('sendEmailButton')" class="contact-section__button text-label">{{ t('sendEmailButton') }}</a>
        </div>

        <!-- The week: one column per day, its hours or "closed", today in mint (admin > Calendar) -->
        <!-- Its own animation: the days of the week drop into place one after the other -->
        <div v-reveal="'cascade'" class="contact-week">
            <div class="contact-week__head">
                <span class="eyebrow">{{ t('contactHours') }}</span>
                <span v-if="settings?.timezone" class="eyebrow contact-week__zone">{{ settings.timezone }}</span>
            </div>
            <ol class="contact-week__days">
                <li v-for="day in days" :key="day.index" :class="{ 'is-closed': !day.slot, 'is-today': day.index === today }">
                    <span class="contact-week__name text-label">{{ t(day.key ?? '') }}</span>
                    <span class="contact-week__hours text-display-s">{{ day.slot ? day.slot.start : '—' }}</span>
                    <span v-if="day.slot" class="contact-week__end text-body-s">{{ day.slot.end }}</span>
                    <span v-else class="contact-week__end text-body-s">{{ t('closedDay') }}</span>
                </li>
            </ol>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useCalendar } from '@/composables/useCalendar'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'

const { getTranslation: t } = useLang()
const site = useSite()
const { settings, fetchSettings } = useCalendar()

// Monday to Sunday, with the hours of each day (none = closed)
const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const days = computed(() => [1, 2, 3, 4, 5, 6, 0].map(index => ({
    index, key: DAY_KEYS[index], slot: settings.value?.schedule?.[index] || null,
})))

// Day of the week in the browser (the server does not highlight any day)
const today = ref(-1)

onMounted(() => {
    today.value = new Date().getDay()
    fetchSettings().catch(err => console.error('Failed to fetch the schedule:', err))
})
</script>
