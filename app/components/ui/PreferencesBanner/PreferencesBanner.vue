<template>
    <!-- Cookie banner, shown until the visitor chooses (texts in plugins/translations/common/preferences.js) -->
    <ClientOnly>
        <Teleport to="body">
            <Transition name="cookie-slide">
                <div v-if="shouldShowBanner" class="cookie-banner" role="region"
                    :aria-label="t('prefsTitle')">
                    <div class="cookie-banner__inner">
                        <div class="cookie-banner__content text-normal">
                            <p>
                                {{ t('prefsText') }}
                            </p>
                            <NuxtLink :to="privacyLink" class="cookie-banner__link text-bold">
                                {{ t('prefsLearnMore') }}
                            </NuxtLink>
                        </div>

                        <div class="cookie-banner__actions">
                            <component :key="`deny-${isMobile}`" :is="isMobile ? FloatingButton : HeroButton"
                                :label="isMobile ? undefined : t('prefsDenyAll')" :size="'small'"
                                iconClass="fas fa-times" :aria-label="t('prefsDenyAll')"
                                :title="t('prefsDenyAll')" @click="handleDenyAll">
                                <template v-if="isMobile"><i class="fas fa-times" aria-hidden="true" /></template>
                            </component>
                            <component :key="`accept-${isMobile}`" :is="isMobile ? FloatingButton : HeroButton"
                                :label="isMobile ? undefined : t('prefsAcceptAll')" :size="'small'"
                                iconClass="fas fa-check" :aria-label="t('prefsAcceptAll')"
                                :title="t('prefsAcceptAll')" @click="handleAcceptAll">
                                <template v-if="isMobile"><i class="fas fa-check" aria-hidden="true" /></template>
                            </component>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </ClientOnly>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import FloatingButton from '@/components/ui/Button/FloatingButton.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import { useUserPreferencesStore } from '@/stores/userPreferences.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'

const { getTranslation: t } = useLang()

const userPreferences = useUserPreferencesStore()
const ready = ref(false)
const isMobile = ref(false)

let mql = null

// Updates isMobile state on breakpoint change
const onMqlChange = (e) => { isMobile.value = e.matches }

onMounted(() => {
    mql = window.matchMedia('(max-width: 768px)')
    isMobile.value = mql.matches
    mql.addEventListener('change', onMqlChange)
    ready.value = true
})

// Cleans up media query listener on unmount
onUnmounted(() => mql?.removeEventListener('change', onMqlChange))

// Only show banner once client is ready and user hasn't consented yet
const shouldShowBanner = computed(() => ready.value && !userPreferences.hasUserMadeChoice)
const privacyLink = computed(() => withTrailingSlash('/privacy'))

const handleAcceptAll = () => userPreferences.acceptAll()
const handleDenyAll = () => userPreferences.denyAll()
</script>
