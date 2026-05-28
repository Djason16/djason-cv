<template>
    <ClientOnly>
        <Teleport to="body">
            <Transition name="cookie-slide">
                <div v-if="shouldShowBanner" class="cookie-banner" role="region"
                    :aria-label="$lang.getTranslation('cookieBannerLabel')">
                    <div class="cookie-banner__inner">
                        <div class="cookie-banner__content text-normal">
                            <p>
                                {{ $lang.getTranslation('cookieMessage') }}
                            </p>
                            <NuxtLink :to="privacyLink" class="cookie-banner__link text-bold">
                                {{ $lang.getTranslation('cookieLearnMore') }}
                            </NuxtLink>
                        </div>

                        <div class="cookie-banner__actions">
                            <component :key="`deny-${isMobile}`" :is="isMobile ? FloatingButton : HeroButton"
                                :label="isMobile ? undefined : $lang.getTranslation('cookieRefuse')" :size="'small'"
                                iconClass="fas fa-times" :aria-label="$lang.getTranslation('cookieRefuse')"
                                :title="$lang.getTranslation('cookieRefuse')" @click="handleDenyAll">
                                <template v-if="isMobile"><i class="fas fa-times" aria-hidden="true" /></template>
                            </component>
                            <component :key="`accept-${isMobile}`" :is="isMobile ? FloatingButton : HeroButton"
                                :label="isMobile ? undefined : $lang.getTranslation('cookieAccept')" :size="'small'"
                                iconClass="fas fa-check" :aria-label="$lang.getTranslation('cookieAccept')"
                                :title="$lang.getTranslation('cookieAccept')" @click="handleAcceptAll">
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
import { useNuxtApp } from '#app'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import FloatingButton from '~/components/ui/Button/FloatingButton.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import { useCookieConsentStore } from '~/stores/cookieConsentStore'
import { withTrailingSlash } from '~/utils/pathHelpers'

const { $lang } = useNuxtApp()
const cookieStore = useCookieConsentStore()
const ready = ref(false)
const isMobile = ref(false)

let mql = null

// Update isMobile state on breakpoint change
const onMqlChange = (e) => { isMobile.value = e.matches }

onMounted(() => {
    mql = window.matchMedia('(max-width: 768px)')
    isMobile.value = mql.matches
    mql.addEventListener('change', onMqlChange)
    ready.value = true
})

// Clean up media query listener on unmount
onUnmounted(() => mql?.removeEventListener('change', onMqlChange))

// Only show banner once client is ready and user hasn't consented yet
const shouldShowBanner = computed(() => ready.value && !cookieStore.hasConsented)
const privacyLink = computed(() => withTrailingSlash('/privacy'))

const handleAcceptAll = () => cookieStore.acceptAll()
const handleDenyAll = () => cookieStore.rejectAll()
</script>

<style scoped>
.cookie-banner {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 90vw;
    z-index: 9000;
    background-color: rgba(82, 97, 107, 0.75);
    backdrop-filter: blur(10px);
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.05);
    transition: all 0.5s ease-in-out, overflow 0s;
}

.cookie-banner__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.75rem;
}

.cookie-banner__content {
    min-width: 0;
}

.cookie-banner__icon {
    margin-right: 0.25rem;
}

.cookie-banner p {
    color: var(--text-color-light);
    margin: 0;
}

.cookie-banner__link {
    white-space: nowrap;
}

.cookie-banner__actions {
    display: flex;
    flex-shrink: 0;
    gap: 0.75rem;
}

.cookie-slide-enter-active,
.cookie-slide-leave-active {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.cookie-slide-enter-from,
.cookie-slide-leave-to {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
}

@media (max-width: 1024px) {
    .cookie-banner {
        width: 100vw;
    }
}

@media (max-width: 768px) {
    .cookie-banner__inner {
        gap: 1vh;
    }

    .cookie-banner__link {
        display: block;
        margin-top: .5vh;
        width: fit-content;
    }
}

@media (max-width: 540px) {
    .cookie-banner__inner {
        flex-direction: column;
        align-items: stretch;
    }

    .cookie-banner__actions {
        align-self: flex-end;
    }
}

@media (max-width: 480px) {
    .cookie-banner__inner {
        padding: 1rem;
    }
}
</style>