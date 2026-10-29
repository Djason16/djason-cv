<template>
    <!--
        Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js).
        It also closes when the visitor changes page without choosing (see below).
    -->
    <ClientOnly>
        <Teleport to="body">
            <Transition name="cookie-slide">
                <div v-if="mounted && !closedForVisit && !userPreferences.hasUserMadeChoice" class="cookie-banner"
                    role="dialog" :aria-label="t('prefsTitle')">
                    <div class="cookie-banner__inner">
                        <div class="cookie-banner__content text-normal">
                            <p>{{ t('prefsText') }}</p>
                            <NuxtLink :to="privacyLink" class="cookie-banner__link text-bold">
                                {{ t('prefsLearnMore') }}
                            </NuxtLink>

                            <!-- One checkbox per category of stores/userPreferences.js -->
                            <div v-if="customizing" class="cookie-banner__categories">
                                <label v-for="(category, name) in userPreferences.categories" :key="name">
                                    <input v-model="choices[name]" type="checkbox" :disabled="category.required">
                                    <span class="text-bold">{{ t(`${name}Label`) }}
                                        <small>{{ t(`${name}Description`) }}</small>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <!-- Round icon buttons on mobile, labelled buttons on larger screens -->
                        <div class="cookie-banner__actions">
                            <component :is="isMobile ? FloatingButton : HeroButton" v-for="action in actions"
                                :key="`${action.key}-${isMobile}`" :label="isMobile ? undefined : action.label"
                                size="small" :iconClass="action.icon" :aria-label="action.label"
                                :title="action.label" @click="action.run">
                                <i v-if="isMobile" :class="action.icon" aria-hidden="true" />
                            </component>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </ClientOnly>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import FloatingButton from '@/components/ui/Button/FloatingButton.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import { useLang } from '@/composables/useLang.js'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'

const { getTranslation: t } = useLang()
const route = useRoute()
const userPreferences = useUserPreferencesStore()
const privacyLink = withTrailingSlash('/privacy')
const customizing = ref(false)
const choices = reactive({ ...userPreferences.preferences })

// Buttons of the banner: "Customize" becomes "Save" once the categories are shown
const actions = computed(() => [
    { key: 'deny', label: t('prefsDenyAll'), icon: 'fas fa-xmark', run: () => userPreferences.denyAll() },
    customizing.value
        ? { key: 'save', label: t('prefsSave'), icon: 'fas fa-floppy-disk', run: () => userPreferences.savePreferences(choices) }
        : { key: 'customize', label: t('prefsCustomize'), icon: 'fas fa-sliders', run: () => { customizing.value = true } },
    { key: 'accept', label: t('prefsAcceptAll'), icon: 'fas fa-check', run: () => userPreferences.acceptAll() },
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
let mql = null
// Round icon buttons below 768px
const onMqlChange = (e) => { isMobile.value = e.matches }

onMounted(() => {
    mql = window.matchMedia('(max-width: 768px)')
    isMobile.value = mql.matches
    mql.addEventListener('change', onMqlChange)
    mounted.value = true
})
onUnmounted(() => mql?.removeEventListener('change', onMqlChange))
</script>
