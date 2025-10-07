<template>
    <OtherSectionLayout pageTitleKey="adminTitle" pageSubtitleKey="adminSubtitle" :sections="adminSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template v-slot:custom-content>
            <div class="admin-dashboard">

                <!-- Admin buttons grid with slide-in animation -->
                <div class="admin-nav">
                    <SlideInFromRight>
                        <RoundButton v-for="(btn, i) in adminButtons" :key="i" :icon="btn.icon"
                            :title="$lang.getTranslation(btn.textKey)" :aria-label="$lang.getTranslation(btn.textKey)"
                            :text="$lang.getTranslation(btn.textKey)" @click="event => handleButtonClick(btn, event)" />
                    </SlideInFromRight>
                </div>

                <!-- Logout button with animation -->
                <SlideInFromRight>
                    <HeroButton :label="$lang.getTranslation(loggingOut ? 'loggingOut' : 'logoutButton')"
                        :ariaLabel="$lang.getTranslation(loggingOut ? 'loggingOut' : 'logoutButton')"
                        :title="$lang.getTranslation(loggingOut ? 'loggingOut' : 'logoutButton')"
                        iconClass="fas fa-sign-out-alt" :disabled="loggingOut" @click="handleLogout" />
                </SlideInFromRight>

                <!-- Feedback messages -->
                <MessageBox :message="translatedMessage" />

                <!-- Password modal with morphing animation -->
                <PasswordModal :show="showModal" :position="modalPosition" :active-button="activeButton"
                    @close="showModal = false" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { seoMetaData } from '@/utils/seo.js'
import { computed, ref, watch } from 'vue'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import RoundButton from '~/components/ui/Button/RoundButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import PasswordModal from '~/components/ui/Modal/PasswordModal.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useAuth } from '~/composables/useAuth'
import { useTranslatedMessage } from '~/composables/useTranslatedMessage'

const { $lang } = useNuxtApp()
const { logout } = useAuth()

// Reactive state
const loggingOut = ref(false)
const message = ref(null)
const showModal = ref(false)
const modalPosition = ref({ top: 0, left: 0 })
const activeButton = ref(null)

// Admin sections data
const adminSections = computed(() =>
    Array.from({ length: 5 }, (_, i) => ({
        titleKey: `adminSection${i + 1}Title`,
        contentKey: `adminSection${i + 1}Content`
    }))
)

// Admin buttons configuration
const adminButtons = [
    { icon: 'fas fa-users', textKey: 'adminClients', action: 'clients' },
    { icon: 'fas fa-file-contract', textKey: 'adminQuotes', action: 'quotes' },
    { icon: 'fas fa-file-signature', textKey: 'adminContracts', action: 'contracts' },
    { icon: 'fas fa-file-invoice-dollar', textKey: 'adminInvoices', action: 'invoices' },
    { icon: 'fas fa-key', textKey: 'adminPassword', action: 'password' }
]

// Generic handler for admin button clicks
const handleButtonClick = (btn, event) => {
    if (btn.action === 'password') {
        activeButton.value = event.currentTarget
        const rect = event.currentTarget.getBoundingClientRect()
        modalPosition.value = { top: rect.top + rect.height / 2, left: rect.left + rect.width / 2, size: rect.width }
        showModal.value = true
    }
}

// SEO metadata
const pageKey = 'admin'
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))

// Computed reactive translation for current message
const { translatedMessage } = useTranslatedMessage(message)

// Handle logout with feedback
const handleLogout = async () => {
    loggingOut.value = true
    if (!(await logout())) message.value = { key: 'logoutError', type: 'error' }
    loggingOut.value = false
}

// Protect page with server-side auth
definePageMeta({ middleware: 'auth-server' })
</script>

<style scoped>
.admin-dashboard {
    text-align: left;
    margin-top: 2rem;
}

.admin-nav {
    display: flex;
    justify-content: center;
    margin: 0 auto 3rem;
    will-change: contents;
}

.admin-nav :deep(.slide-in-from-right) {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: calc(2rem + 1vw);
    justify-items: center;
    padding: 0 2.5vw;
    transition: grid-template-columns 0.3s ease, gap 0.3s ease;
}

@media (max-width: 1440px) {
    .admin-nav :deep(.slide-in-from-right) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }

    .admin-nav :deep(.slide-in-from-right > *:nth-child(5):last-child) {
        grid-column: 1 / -1;
        justify-self: center;
        transition: grid-column 0.3s ease, justify-self 0.3s ease;
    }
}

@media (max-width: 425px) {
    .admin-nav :deep(.slide-in-from-right) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
</style>