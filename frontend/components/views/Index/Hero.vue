<template>
    <!--
        Home page: full screen opening. A small line, the name very large in serif, the main sentence;
        a bottom line with the availability of the moment, a way down, the jobs.
    -->
    <section id="hero-banner" ref="hero" class="hero" aria-labelledby="hero-title" @pointermove="followPointer">
        <!-- Soft light following the mouse (large screens only) -->
        <div class="hero__light" aria-hidden="true"></div>

        <div class="hero__center">
            <p class="hero__line eyebrow">{{ t('heroLine', { place: site.area }) }}</p>
            <!-- Each letter of the name comes in from a blur, one after the other; the letters kept by word:
                 a line can break between two words, never inside one -->
            <p class="hero__name text-display-xl">
                <!-- The name read by screen readers and Google (the letters below are only drawn) -->
                <span class="hero__name-text">{{ site.name }}</span>
                <template v-for="(word, w) in words" :key="w">
                    <span class="hero__word" aria-hidden="true"><span v-for="letter in word.letters" :key="letter.i" class="hero__letter" :style="{ '--i': letter.i }">{{ letter.char }}</span></span>{{ w < words.length - 1 ? ' ' : '' }}
                </template>
            </p>
            <h1 id="hero-title" class="hero__sentence text-body-l">{{ t('welcomeToMyWebsite') }}</h1>
        </div>

        <div class="hero__bar text-label">
            <!-- Availability of the moment (admin > Calendar / Unavailability) -->
            <p class="hero__status" role="status" aria-live="polite">
                <span class="hero__dot" :class="`is-${currentAvailability}`" aria-hidden="true"></span>
                {{ t(currentAvailability) }}
            </p>

            <a href="#projects" class="hero__down" :aria-label="t('lastProjects')" :title="t('lastProjects')" @click.prevent="scrollToSection('projects')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 4v16M6 14l6 6 6-6" /></svg>
            </a>

            <p class="hero__jobs">{{ t('heroJobs') }}</p>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useCalendar } from '@/composables/useCalendar'
import { useLang } from '@/composables/useLang'
import { useSite } from '@/composables/useSite'
import { useUnavailability } from '@/composables/useUnavailability'
import { onDataChange } from '@/composables/useLiveData'
import { getAvailability } from '@/utils/availability'
import { scrollToSection } from '@/utils/scroll'

const lang = useLang()
const { getTranslation: t } = lang
const site = useSite()

const { periods, override, fetchAll: fetchAvailability } = useUnavailability()
const { settings, fetchSettings } = useCalendar()

// Letters of the name (a space stays a space)
// The words of the name, each letter with its place in the whole name (the delay of its coming in)
const words = computed(() => {
    let i = 0
    return String(site.name || '').split(/\s+/).filter(Boolean).map(word => ({ letters: [...word].map(char => ({ char, i: i++ })) }))
})

// Light under the mouse: its place is given to the CSS, at most once per frame
const hero = ref<any>(null)
let frame = 0
const followPointer = (event: PointerEvent) => {
    if (frame || event.pointerType !== 'mouse') return
    frame = requestAnimationFrame(() => {
        frame = 0
        const box = hero.value?.getBoundingClientRect()
        if (!box) return
        hero.value.style.setProperty('--mx', `${event.clientX - box.left}px`)
        hero.value.style.setProperty('--my', `${event.clientY - box.top}px`)
    })
}

// Availability of the moment: 'available', 'busy' or 'unavailable'
const currentAvailability = ref('available')
const dataLoaded = ref(false)

const updateAvailability = () => {
    if (dataLoaded.value) currentAvailability.value = getAvailability(periods.value, override.value, settings.value ?? {})
}

// Loaded once in the browser, worked out again every minute (no new request)
let intervalId: ReturnType<typeof setInterval> | undefined
onMounted(async () => {
    try {
        await Promise.all([fetchAvailability(), fetchSettings()])
    } catch (err) {
        return console.error('Failed to fetch the availability:', err)
    }
    dataLoaded.value = true
    updateAvailability()
    intervalId = setInterval(updateAvailability, 60000)
})
onUnmounted(() => clearInterval(intervalId))
// A change of the admin (holidays, forced status, schedule): loaded again, only when it happened
onDataChange(['dc_unavailability', 'dc_availability_override', 'dc_calendar_settings'], async () => {
    await Promise.all([fetchAvailability(), fetchSettings()])
    updateAvailability()
}, () => dataLoaded.value)

watch([periods, override, settings], updateAvailability, { deep: true })
</script>
