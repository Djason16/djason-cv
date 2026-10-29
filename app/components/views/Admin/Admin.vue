<template>
    <!-- Admin dashboard: one button per tool (each opens its modal), logout and database backups -->
    <OtherSectionLayout pageTitleKey="adminTitle" pageSubtitleKey="adminSubtitle" :sections="adminSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template #custom-content>
            <div class="admin-dashboard">
                <!-- One button per tool -->
                <div class="admin-nav">
                    <SlideInFromRight>
                        <RoundButton v-for="btn in adminButtons" :key="btn.textKey" :icon="btn.icon"
                            :title="t(btn.textKey)" :aria-label="t(btn.textKey)"
                            :text="t(btn.textKey)" :hide-content="activeModal === btn"
                            @click="e => openModal(btn, e)" />
                    </SlideInFromRight>
                </div>

                <!-- Logout and database tools -->
                <SlideInFromRight>
                    <div class="login-buttons">
                        <HeroButton v-for="btn in toolButtons" :key="btn.labelKey"
                            :label="t(btn.busy?.value ? btn.busyKey : btn.labelKey)"
                            :ariaLabel="t(btn.labelKey)" :iconClass="btn.icon"
                            :disabled="btn.busy?.value" @click="btn.action" />
                    </div>
                </SlideInFromRight>

                <MessageBox :message="translatedMessage" />

                <!-- Hidden file input for DB replacement -->
                <input type="file" ref="refFileInput" style="display:none" accept=".sqlite" @change="replaceDatabase" />

                <!-- One modal per admin button (components/views/Admin) -->
                <component v-for="btn in adminButtons" :key="btn.textKey" :is="btn.component" v-bind="btn.props"
                    :show="activeModal === btn" :position="modalPosition" :active-button="activeButton"
                    @close="activeModal = null" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { ref, shallowRef } from 'vue'
import SlideInFromRight from '@/components/ui/Animation/SlideInFromRight.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import RoundButton from '@/components/ui/Button/RoundButton.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'
import CalendarModal from '@/components/views/Admin/CalendarModal.vue'
import ClientListModal from '@/components/views/Admin/ClientListModal.vue'
import CreateClientModal from '@/components/views/Admin/CreateClientModal.vue'
import CreateMissionModal from '@/components/views/Admin/CreateMissionModal.vue'
import CreateProjectModal from '@/components/views/Admin/CreateProjectModal.vue'
import DocumentsModal from '@/components/views/Admin/DocumentsModal.vue'
import EnvModal from '@/components/views/Admin/EnvModal.vue'
import InterestRatesListModal from '@/components/views/Admin/InterestRatesListModal.vue'
import ManualOverrideModal from '@/components/views/Admin/ManualOverrideModal.vue'
import MissionListModal from '@/components/views/Admin/MissionListModal.vue'
import PasswordModal from '@/components/views/Admin/PasswordModal.vue'
import ProjectListModal from '@/components/views/Admin/ProjectListModal.vue'
import UnavailabilityModal from '@/components/views/Admin/UnavailabilityModal.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useMessage } from '@/composables/useMessage.js'
import { api } from '@/utils/api.js'

const { getTranslation: t } = useLang()

const { logout } = useAuth()
const { translatedMessage, showMessage, clearMessage } = useMessage()

// Button of the open modal, and where it is: the modal grows from the button
const activeModal = shallowRef(null)
const activeButton = ref(null)
const modalPosition = ref({ top: 0, left: 0 })
const loggingOut = ref(false)
const refFileInput = ref(null)

// Tools of the dashboard and their modal (components/views/Admin)
const adminButtons = [
    { icon: 'fas fa-user-plus', textKey: 'adminCreateClients', component: CreateClientModal },
    { icon: 'fas fa-users', textKey: 'adminClients', component: ClientListModal },
    { icon: 'fas fa-plus-circle', textKey: 'adminCreateMissions', component: CreateMissionModal },
    { icon: 'fas fa-tasks', textKey: 'adminMissions', component: MissionListModal },
    { icon: 'fas fa-file-contract', textKey: 'adminQuotes', component: DocumentsModal, props: { kind: 'quote' } },
    { icon: 'fas fa-percent', textKey: 'adminInterestRates', component: InterestRatesListModal },
    { icon: 'fas fa-file-signature', textKey: 'adminContracts', component: DocumentsModal, props: { kind: 'contract' } },
    { icon: 'fas fa-file-invoice-dollar', textKey: 'adminInvoices', component: DocumentsModal, props: { kind: 'invoice' } },
    { icon: 'fas fa-key', textKey: 'adminPassword', component: PasswordModal },
    { icon: 'fas fa-calendar-alt', textKey: 'adminCalendar', component: CalendarModal },
    { icon: 'fas fa-calendar-times', textKey: 'adminUnavailability', component: UnavailabilityModal },
    { icon: 'fas fa-toggle-on', textKey: 'adminManualOverride', component: ManualOverrideModal },
    { icon: 'fas fa-folder-plus', textKey: 'adminCreateProjects', component: CreateProjectModal },
    { icon: 'fas fa-folder-open', textKey: 'adminProjects', component: ProjectListModal },
    { icon: 'fas fa-cog', textKey: 'adminEnvironment', component: EnvModal }
]

// Logs out (useAuth redirects to the login page)
const signOut = async () => {
    clearMessage()
    loggingOut.value = true
    const ok = await logout()
    showMessage(ok ? 'success' : 'error', ok ? 'logoutSuccess' : 'logoutError')
    loggingOut.value = false
}

// Buttons under the dashboard: logout and database backup
const toolButtons = [
    { labelKey: 'logoutButton', busyKey: 'loggingOut', busy: loggingOut, icon: 'fas fa-sign-out-alt', action: signOut },
    { labelKey: 'replaceDB', icon: 'fas fa-upload', action: () => { clearMessage(); refFileInput.value.value = ''; refFileInput.value.click() } },
    { labelKey: 'downloadDB', icon: 'fas fa-database', action: () => download('/database/download-db', 'db.sqlite', 'downloadSuccess', 'downloadError') },
    { labelKey: 'exportSQL', icon: 'fas fa-file-export', action: () => download('/database/export-sql', 'backup.sql', 'exportSuccess', 'exportError') }
]

// Opens the modal of a tool from the center of its button
const openModal = (btn, e) => {
    const r = e.currentTarget.getBoundingClientRect()
    activeButton.value = e.currentTarget
    modalPosition.value = { top: r.top + r.height / 2, left: r.left + r.width / 2, size: r.width }
    activeModal.value = btn
}

// Database backup: download the SQLite file or an SQL dump (server/controllers/DatabaseController.js)
const download = async (endpoint, filename, successKey, errorKey) => {
    clearMessage()
    const res = await api.download(endpoint, filename)
    showMessage(res.success ? 'success' : 'error', res.success ? successKey : errorKey)
}

// Database replacement by the .sqlite file picked in the hidden input, then reload once the server is ready
const replaceDatabase = async event => {
    const file = event.target.files?.[0]
    if (!file) return
    showMessage('success', 'replaceSuccess')

    const formData = new FormData()
    formData.append('file', file)
    const res = await api.post('/database/replace-db', formData)

    // A 4xx is a refused file; a network failure means the server is already restarting
    if (!res.success && res.status >= 400 && res.status < 500) return showMessage('error', 'replaceError')
    setTimeout(() => window.location.reload(), 3000)
}

// Text sections of the page (adminSection1Title... in plugins/translations/pages/admin/dashboard.js)
const adminSections = Array.from({ length: 5 }, (_, i) => ({ titleKey: `adminSection${i + 1}Title`, contentKey: `adminSection${i + 1}Content` }))
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