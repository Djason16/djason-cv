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

                <!-- Hidden file input for DB replacement -->
                <input type="file" ref="refFileInput" style="display:none" accept=".sqlite" />

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
import CalendarModal from '~/components/ui/Modal/ModalDialog/CalendarModal.vue'
import ClientListModal from '~/components/ui/Modal/ModalDialog/ClientListModal.vue'
import ContractModal from '~/components/ui/Modal/ModalDialog/ContractModal.vue'
import CreateClientModal from '~/components/ui/Modal/ModalDialog/CreateClientModal.vue'
import CreateMissionModal from '~/components/ui/Modal/ModalDialog/CreateMissionModal.vue'
import CreateProjectModal from '~/components/ui/Modal/ModalDialog/CreateProjectModal.vue'
import EnvModal from '~/components/ui/Modal/ModalDialog/EnvModal.vue'
import InterestRatesListModal from '~/components/ui/Modal/ModalDialog/InterestRatesListModal.vue'
import InvoicesModal from '~/components/ui/Modal/ModalDialog/InvoicesModal.vue'
import ManualOverrideModal from '~/components/ui/Modal/ModalDialog/ManualOverrideModal.vue'
import MissionListModal from '~/components/ui/Modal/ModalDialog/MissionListModal.vue'
import PasswordModal from '~/components/ui/Modal/ModalDialog/PasswordModal.vue'
import ProjectListModal from '~/components/ui/Modal/ModalDialog/ProjectListModal.vue'
import QuotesModal from '~/components/ui/Modal/ModalDialog/QuotesModal.vue'
import UnavailabilityModal from '~/components/ui/Modal/ModalDialog/UnavailabilityModal.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useAuth } from '~/composables/useAuth'
import { useDatabase } from '~/composables/useDatabase'
import { useMessage } from '~/composables/useMessage'

const { $lang } = useNuxtApp()
await $lang.loadGroup('admin')
const { logout } = useAuth()
const { replaceDatabase } = useDatabase()

// Message composable
const { translatedMessage, showMessage, clearMessage } = useMessage()

// UI reactive state
const loggingOut = ref(false)
const activeButton = ref(null)
const modalPosition = ref({ top: 0, left: 0 })
const activeModal = ref(null)
const refFileInput = ref(null)

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
    { icon: 'fas fa-key', textKey: 'adminPassword', action: 'password' },
    { icon: 'fas fa-calendar-alt', textKey: 'adminCalendar', action: 'calendar' },
    { icon: 'fas fa-calendar-times', textKey: 'adminUnavailability', action: 'unavailability' },
    { icon: 'fas fa-toggle-on', textKey: 'adminManualOverride', action: 'manualOverride' },
    { icon: 'fas fa-folder-plus', textKey: 'adminCreateProjects', action: 'createProjects' },
    { icon: 'fas fa-folder-open', textKey: 'adminProjects', action: 'projects' },
    { icon: 'fas fa-cog', textKey: 'adminEnvironment', action: 'environment' }
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
    { action: 'password', component: PasswordModal },
    { action: 'calendar', component: CalendarModal },
    { action: 'unavailability', component: UnavailabilityModal },
    { action: 'manualOverride', component: ManualOverrideModal },
    { action: 'createProjects', component: CreateProjectModal },
    { action: 'projects', component: ProjectListModal },
    { action: 'environment', component: EnvModal }
]

// Login & DB buttons with actions
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
        labelKey: 'replaceDB',
        icon: 'fas fa-upload',
        action: () => handleDatabaseReplace()
    },
    {
        labelKey: 'downloadDB',
        icon: 'fas fa-database',
        action: () => handleFileAction('/api/database/download-db', 'db.sqlite', 'downloadSuccess', 'downloadError')
    },
    {
        labelKey: 'exportSQL',
        icon: 'fas fa-file-export',
        action: () => handleFileAction('/api/database/export-sql', 'backup.sql', 'exportSuccess', 'exportError')
    }
])

// Modal management
const handleButtonClick = (btn, e) =>
    activeModals.some(m => m.action === btn.action) ? openModal(btn, e) : console.log('No modal:', btn.action)

const openModal = (btn, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    activeButton.value = e.currentTarget
    modalPosition.value = { top: r.top + r.height / 2, left: r.left + r.width / 2, size: r.width }
    activeModal.value = btn
}

const closeModal = () => (activeModal.value = null)

// Database replacement with restart handling
const handleDatabaseReplace = async () => {
    clearMessage()
    try {
        const fileInput = refFileInput.value
        if (!fileInput) throw new Error('File input not found')

        fileInput.value = ''
        fileInput.click()

        const file = await new Promise((resolve, reject) => {
            const handler = e => {
                fileInput.removeEventListener('change', handler)
                e.target.files?.length ? resolve(e.target.files[0]) : reject(new Error('No file selected'))
            }
            fileInput.addEventListener('change', handler)
        })

        showMessage('success', 'replaceSuccess')
        await replaceDatabase(file)
        // Page will reload automatically after restart
    } catch (e) {
        console.error(e)
        if (e.message !== 'No file selected') {
            showMessage('error', 'replaceError')
        }
    }
}

// File download helper
const handleFileAction = async (url, filename, successKey, errorKey) => {
    clearMessage()
    try {
        const res = await fetch(url, { method: 'GET' })
        if (!res.ok) throw new Error('Request failed')
        const blob = await res.blob()
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename })
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
    grid-template-columns: repeat(4, 1fr);
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

@media (max-width: 1440px) {
    .admin-nav :deep(.slide-in-from-right) {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .admin-nav :deep(.slide-in-from-right) {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
}

@media (max-width: 375px) {
    .admin-nav :deep(.slide-in-from-right) {
        grid-template-columns: 1fr;
    }

    .admin-nav :deep(.slide-in-from-right > *) {
        grid-column: 1 / -1;
        justify-self: center;
    }
}
</style>