<template>
    <!--
        Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js).
        It also closes when the visitor changes page without choosing (see below).
    -->
    <ClientOnly>
        <Teleport to="body">
            <Transition name="cookie-slide">
                <div v-if="visible" class="cookie-banner"
                    role="dialog" :aria-label="t('prefsTitle')">
                    <div class="cookie-banner__inner">
                        <div class="cookie-banner__content text-body">
                            <!-- Title in small capitals with the green line of the site -->
                            <p class="cookie-banner__title text-label">
                                <i class="fas fa-cookie-bite" aria-hidden="true" /> {{ t('prefsTitle') }}
                            </p>
                            <p>{{ t('prefsText') }}</p>
                            <NuxtLink :to="privacyLink" :title="t('prefsLearnMore')" class="cookie-banner__link text-bold">
                                {{ t('prefsLearnMore') }}
                            </NuxtLink>

                            <!-- One checkbox per category of stores/userPreferences.js -->
                            <div v-if="customizing" class="cookie-banner__categories">
                                <label v-for="(category, name) in userPreferences.categories" :key="name">
                                    <input v-model="choices[name]" type="checkbox" role="switch" class="cookie-banner__switch"
                                        :disabled="category.required">
                                    <span><span class="text-bold">{{ t(`${name}Label`) }}</span>
                                        <small class="text-body-s">{{ t(`${name}Description`) }}</small>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <!-- Icon buttons (IconButton): with their text on a computer, the icon only on a phone; "Accept all" is the main one -->
                        <div class="cookie-banner__actions">
                            <IconButton v-for="action in actions" :key="action.key" :icon="action.icon" :label="action.label"
                                :text="isMobile ? '' : action.label"
                                :variant="action.key === 'accept' ? 'primary' : 'ghost'" @click="action.run" />
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import IconButton from '@/components/ui/Button/IconButton.vue'
import { useLang } from '@/composables/useLang'
import { useUserPreferencesStore } from '@/stores/userPreferences'
import { withTrailingSlash } from '@/utils/pathHelpers'

const { getTranslation: t } = useLang()
const route = useRoute()
const userPreferences = useUserPreferencesStore()
const privacyLink = withTrailingSlash('/privacy')
const customizing = ref(false)
const choices = reactive({ ...userPreferences.preferences })

// Buttons of the banner (icon: name of an IconButton icon); "Customize" becomes "Save" once the categories are shown
const actions = computed(() => [
    { key: 'deny', label: t('prefsDenyAll'), icon: 'close', run: () => userPreferences.denyAll() },
    customizing.value
        ? { key: 'save', label: t('prefsSave'), icon: 'save', run: () => userPreferences.savePreferences(choices) }
        : { key: 'customize', label: t('prefsCustomize'), icon: 'sliders', run: () => { customizing.value = true } },
    { key: 'accept', label: t('prefsAcceptAll'), icon: 'check', run: () => userPreferences.acceptAll() },
])

// Page change without a choice: the banner closes for this visit only.
// This is not a consent (GDPR): nothing is saved, optional cookies stay refused and the banner comes back next visit.
// Opened again from "Cookie settings" then page change: it closes on the saved choice.
const closedForVisit = ref(false)
watch(() => route.path, () => {
    if (userPreferences.hasUserMadeChoice) return
    if (!userPreferences.loadPreferences()) closedForVisit.value = true
    customizing.value = false
})

// Opened again from "Cookie settings": shown even if it was closed, the boxes show the current choice
watch(() => [userPreferences.hasUserMadeChoice, userPreferences.settingsOpenCount], ([made]) => {
    if (made) return
    closedForVisit.value = false
    Object.assign(choices, userPreferences.preferences)
    customizing.value = true
})

// Only shown in the browser: the cookie with the choice is not known while the server renders the page
const mounted = ref(false)
const isMobile = ref(false)
let mql: MediaQueryList | null = null
// Icon buttons below 768px
const onMqlChange = (e: MediaQueryListEvent) => { isMobile.value = e.matches }

onMounted(() => {
    mql = window.matchMedia('(max-width: 768px)')
    isMobile.value = mql.matches
    mql.addEventListener('change', onMqlChange)
    mounted.value = true
})
onUnmounted(() => mql?.removeEventListener('change', onMqlChange))

// Banner on screen, shared with the rest of the site (the floating buttons hide while it is open)
const visible = computed(() => mounted.value && !closedForVisit.value && !userPreferences.hasUserMadeChoice)
watch(visible, open => { userPreferences.bannerOpen = open }, { immediate: true })
</script>
