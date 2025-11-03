<template>
    <OtherSectionLayout pageTitleKey="adminTitle" pageSubtitleKey="adminSubtitle" :sections="adminSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template #custom-content>
            <div class="admin-dashboard">
                <!-- Main admin buttons -->
                <div class="admin-nav">
                    <SlideInFromRight>
                        <RoundButton v-for="(btn, i) in adminButtons" :key="i" :icon="btn.icon"
                            :title="$lang.getTranslation(btn.textKey)" :aria-label="$lang.getTranslation(btn.textKey)"
                            :text="$lang.getTranslation(btn.textKey)" :hide-content="activeModal?.action === btn.action"
                            @click="e => handleButtonClick(btn, e)" />
                    </SlideInFromRight>
                </div>

                <!-- Logout / DB tools -->
                <SlideInFromRight>
                    <div class="login-buttons">
                        <HeroButton v-for="(btn, i) in loginButtons" :key="i"
                            :label="$lang.getTranslation(btn.labelKey)" :ariaLabel="$lang.getTranslation(btn.labelKey)"
                            :iconClass="btn.icon" :disabled="btn.disabled?.()" @click="btn.action" />
                    </div>
                </SlideInFromRight>

                <!-- Feedback messages -->
                <MessageBox :message="translatedMessage" />

                <!-- Dynamic modals -->
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
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import RoundButton from '~/components/ui/Button/RoundButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import ClientListModal from '~/components/ui/Modal/ModalDialog/ClientListModal.vue'
import ContractModal from '~/components/ui/Modal/ModalDialog/ContractModal.vue'
import CreateClientModal from '~/components/ui/Modal/ModalDialog/CreateClientModal.vue'
import CreateMissionModal from '~/components/ui/Modal/ModalDialog/CreateMissionModal.vue'
import InterestRatesListModal from '~/components/ui/Modal/ModalDialog/InterestRatesListModal.vue'
import InvoicesModal from '~/components/ui/Modal/ModalDialog/InvoicesModal.vue'
import MissionListModal from '~/components/ui/Modal/ModalDialog/MissionListModal.vue'
import PasswordModal from '~/components/ui/Modal/ModalDialog/PasswordModal.vue'
import QuotesModal from '~/components/ui/Modal/ModalDialog/QuotesModal.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useAuth } from '~/composables/useAuth'
import { useMessage } from '~/composables/useMessage'

const { $lang } = useNuxtApp()
const { logout } = useAuth()

// Message composable
const { translatedMessage, showMessage, clearMessage } = useMessage()

// UI reactive state
const loggingOut = ref(false)
const activeButton = ref(null)
const modalPosition = ref({ top: 0, left: 0 })
const activeModal = ref(null)

// Admin button and modal configuration
const adminButtons = [
    { icon: 'fas fa-user-plus', textKey: 'adminCreateClients', action: 'createClients' },
    { icon: 'fas fa-users', textKey: 'adminClients', action: 'clients' },
    { icon: 'fas fa-plus-circle', textKey: 'adminCreateMissions', action: 'createMissions' },
    { icon: 'fas fa-tasks', textKey: 'adminMissions', action: 'missions' },
    { icon: 'fas fa-file-contract', textKey: 'adminQuotes', action: 'quotes' },
    { icon: 'fas fa-percent', textKey: 'adminInterestRates', action: 'interestRates' },
    { icon: 'fas fa-file-signature', textKey: 'adminContracts', action: 'contracts' },
    { icon: 'fas fa-file-invoice-dollar', textKey: 'adminInvoices', action: 'invoices' },
    { icon: 'fas fa-key', textKey: 'adminPassword', action: 'password' }
]
const activeModals = [
    { action: 'createClients', component: CreateClientModal },
    { action: 'clients', component: ClientListModal },
    { action: 'createMissions', component: CreateMissionModal },
    { action: 'missions', component: MissionListModal },
    { action: 'quotes', component: QuotesModal },
    { action: 'interestRates', component: InterestRatesListModal },
    { action: 'contracts', component: ContractModal },
    { action: 'invoices', component: InvoicesModal },
    { action: 'password', component: PasswordModal }
]

// Login and DB actions (looped)
const loginButtons = computed(() => [
    {
        labelKey: loggingOut.value ? 'loggingOut' : 'logoutButton',
        icon: 'fas fa-sign-out-alt',
        disabled: () => loggingOut.value,
        action: async () => {
            clearMessage()
            loggingOut.value = true
            const ok = await logout()
            showMessage(ok ? 'success' : 'error', ok ? 'logoutSuccess' : 'logoutError')
            loggingOut.value = false
        }
    },
    {
        labelKey: 'downloadDB',
        icon: 'fas fa-database',
        action: async () => handleFileAction('/api/database/download-db', 'db.sqlite', 'downloadSuccess', 'downloadError')
    },
    {
        labelKey: 'exportSQL',
        icon: 'fas fa-file-export',
        action: async () => handleFileAction('/api/database/export-sql', 'backup.sql', 'exportSuccess', 'exportError')
    }
])

// Modal management
const handleButtonClick = (btn, e) =>
    activeModals.some(m => m.action === btn.action)
        ? openModal(btn, e)
        : console.log('No modal for', btn.action)

const openModal = (btn, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    activeButton.value = e.currentTarget
    modalPosition.value = { top: r.top + r.height / 2, left: r.left + r.width / 2, size: r.width }
    activeModal.value = btn
}

const closeModal = () => activeModal.value = null

// Generic file download/export helper
const handleFileAction = async (url, filename, successKey, errorKey) => {
    clearMessage()
    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error('Request failed')
        const blob = await res.blob()
        const a = Object.assign(document.createElement('a'), {
            href: URL.createObjectURL(blob),
            download: filename
        })
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(a.href)
        showMessage('success', successKey)
    } catch (e) {
        console.error(e)
        showMessage('error', errorKey)
    }
}

// SEO and page metadata
const pageKey = 'admin'
const adminSections = computed(() =>
    Array.from({ length: 5 }, (_, i) => ({
        titleKey: `adminSection${i + 1}Title`,
        contentKey: `adminSection${i + 1}Content`
    }))
)
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))

// Secure access
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
    grid-template-columns: repeat(3, 1fr);
    justify-items: center;
    gap: calc(2rem + 1vw);
    padding: 0 2.5vw;
    transition: grid-template-columns .3s ease, gap .3s ease;
}

.admin-nav :deep(.slide-in-from-right > *) {
    grid-column: span 1;
    justify-self: center;
}

.login-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

@media (max-width: 1920px) {
    .admin-nav :deep(.slide-in-from-right) {
        gap: 1.5rem;
    }
}

@media (max-width: 768px) {
    .admin-nav :deep(.slide-in-from-right) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .admin-nav :deep(.slide-in-from-right > *:nth-child(n+9)) {
        grid-column: span 2;
        justify-self: center;
    }
}

@media (max-width: 375px) {
    .admin-nav :deep(.slide-in-from-right > *) {
        grid-column: 1 / -1;
        justify-self: center;
    }
}
</style>