<template>
    <OtherSectionLayout pageTitleKey="adminTitle" pageSubtitleKey="adminSubtitle" :sections="adminSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template #custom-content>
            <div class="admin-dashboard">
                <!-- Admin buttons grid -->
                <div class="admin-nav">
                    <SlideInFromRight>
                        <RoundButton v-for="(btn, i) in adminButtons" :key="i" :icon="btn.icon"
                            :title="$lang.getTranslation(btn.textKey)" :aria-label="$lang.getTranslation(btn.textKey)"
                            :text="$lang.getTranslation(btn.textKey)" :hide-content="activeModal?.action === btn.action"
                            @click="(e) => handleButtonClick(btn, e)" />
                    </SlideInFromRight>
                </div>

                <!-- Logout button -->
                <SlideInFromRight>
                    <HeroButton :label="$lang.getTranslation(loggingOut ? 'loggingOut' : 'logoutButton')"
                        :ariaLabel="$lang.getTranslation(loggingOut ? 'loggingOut' : 'logoutButton')"
                        iconClass="fas fa-sign-out-alt" :disabled="loggingOut" @click="handleLogout" />
                </SlideInFromRight>

                <!-- Message display -->
                <MessageBox :message="translatedMessage" />

                <!-- Dynamic modals rendering -->
                <component v-for="modal in activeModals" :key="modal.action" :is="modal.component"
                    :show="activeModal?.action === modal.action" :position="modalPosition" :active-button="activeButton"
                    @close="closeModal" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { seoMetaData } from '@/utils/seo.js'
import { computed, ref, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useTranslatedMessage } from '~/composables/useTranslatedMessage'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import RoundButton from '~/components/ui/Button/RoundButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import PasswordModal from '~/components/ui/Modal/ModalDialog/PasswordModal.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'

const { $lang } = useNuxtApp()
const { logout } = useAuth()
const { translatedMessage } = useTranslatedMessage(ref(null))

// UI state
const loggingOut = ref(false)
const activeButton = ref(null)
const modalPosition = ref({ top: 0, left: 0 })
const activeModal = ref(null)

// Admin buttons config
const adminButtons = [
    { icon: 'fas fa-users', textKey: 'adminClients', action: 'clients' },
    { icon: 'fas fa-file-contract', textKey: 'adminQuotes', action: 'quotes' },
    { icon: 'fas fa-file-signature', textKey: 'adminContracts', action: 'contracts' },
    { icon: 'fas fa-file-invoice-dollar', textKey: 'adminInvoices', action: 'invoices' },
    { icon: 'fas fa-key', textKey: 'adminPassword', action: 'password' }
]

// Registered modals
const activeModals = [{ action: 'password', component: PasswordModal }]

// Handle button click: open modal if exists, else log
const handleButtonClick = (btn, e) => {
    activeModals.find(m => m.action === btn.action)
        ? openModal(btn, e)
        : console.log('Button without modal clicked:', btn.action)
}

// Open modal and record trigger button position
const openModal = (btn, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    activeButton.value = e.currentTarget
    modalPosition.value = { top: rect.top + rect.height / 2, left: rect.left + rect.width / 2, size: rect.width }
    activeModal.value = btn
}

// Close modal
const closeModal = () => (activeModal.value = null)

// Logout with feedback
const handleLogout = async () => {
    loggingOut.value = true
    const ok = await logout()
    if (!ok) translatedMessage.value = { key: 'logoutError', type: 'error' }
    loggingOut.value = false
}

// Generate admin sections dynamically
const adminSections = computed(() =>
    Array.from({ length: 5 }, (_, i) => ({ titleKey: `adminSection${i + 1}Title`, contentKey: `adminSection${i + 1}Content` }))
)

// SEO metadata
const pageKey = 'admin'
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))

// Protect route
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
}

.admin-nav :deep(.slide-in-from-right) {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    justify-items: center;
    gap: calc(2rem + 1vw);
    padding: 0 2.5vw;
    transition: grid-template-columns .3s ease, gap .3s ease;
}

@media (max-width: 1440px) {
    .admin-nav :deep(.slide-in-from-right) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
    }

    .admin-nav :deep(.slide-in-from-right > *:nth-child(5):last-child) {
        grid-column: 1 / -1;
        justify-self: center;
    }
}

@media (max-width: 425px) {
    .admin-nav :deep(.slide-in-from-right) {
        grid-template-columns: 1fr;
        gap: 1rem;
    }
}
</style>