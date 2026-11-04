<!-- Admin dashboard, the simplest first: what waits for you (one click opens it at its next step), the four things made the most
     (quote, invoice, mission, client), the tools of the work and of the site, then the settings folded, then logout.
     A list opens its form itself (New / Edit) and comes back when the form closes. -->
<template>
    <OtherSectionLayout pageTitleKey="adminTitle" pageSubtitleKey="adminSubtitle" :sections="adminSections">
        <template #custom-content>
            <!-- Every name of the cards of tools the same size: the longest word of all of them (card-grid.css) -->
            <div class="admin-dashboard" :style="{ '--letters': toolLetters }">
                <!-- Reminder: the consumer mediator is required with individuals (shown in the terms) -->
                <p v-if="!site.mediatorName" class="admin-reminder text-body-s">{{ t('mediatorMissing') }}</p>

                <!-- What waits for you, and what the server does alone -->
                <AdminTodo :refresh="refreshTodo" @open="openTodo" />

                <!-- The four things made the most -->
                <div class="admin-quick">
                    <HeroButton v-for="action in QUICK" :key="action.key" :primary="action.primary" :iconClass="action.icon" :label="t(action.key)"
                        @click="e => openTool(action.tool, e, action.props)" />
                </div>

                <!-- One part per task, its tools in the card grid of the site, rising one after the other; the settings folded -->
                <section v-for="(group, g) in shownGroups" :key="group.key" class="admin-group">
                    <p class="admin-group__label eyebrow">{{ padIndex(g) }} · {{ t(group.key) }}</p>
                    <ul class="admin-nav card-grid card-grid--large">
                        <li v-for="(id, i) in group.tools" :key="id" v-reveal class="admin-nav__item"
                            :style="{ '--reveal-delay': `calc(var(--reveal-stagger) * ${i % 4})` }">
                            <ToolCard :icon="TOOLS[id].icon" :code="padIndex(i, group.code)"
                                :title="t(TOOLS[id].textKey)" :aria-label="t(TOOLS[id].textKey)" :text="t(TOOLS[id].textKey)"
                                :hint="t(`adminHint_${id}`)" :hide-content="active === id" @click="e => openTool(id, e)" />
                        </li>
                    </ul>
                </section>

                <button type="button" class="admin-settings-toggle text-label" :aria-expanded="showSettings" @click="showSettings = !showSettings">
                    {{ t(showSettings ? 'adminHideSettings' : 'adminShowSettings') }} {{ showSettings ? '↑' : '↓' }}
                </button>

                <!-- Logout -->
                <div class="login-buttons">
                    <HeroButton :label="t(loggingOut ? 'loggingOut' : 'logoutButton')" :ariaLabel="t('logoutButton')"
                        iconClass="fas fa-sign-out-alt" :disabled="loggingOut" @click="signOut" />
                </div>

                <MessageBox :message="translatedMessage" />

                <!-- One modal per tool (components/views/Admin) -->
                <component v-for="(tool, id) in TOOLS" :key="id" :is="tool.component" v-bind="active === id ? toolProps : {}"
                    :show="active === id" :active-button="activeButton"
                    v-on="tool.opens ? { open: (next, props) => openFrom(id, next, props) } : {}" @close="closeTool" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { goToPage } from '@/composables/useAuth.js'
import { MESSAGE_DELAY, afterMessage } from '@/utils/feedback.js'
import { longestWord, padIndex } from '@/utils/display.js'
import { useSite } from '@/composables/useSite.js'
import { useLang } from '@/composables/useLang.js'
import { computed, ref, shallowRef } from 'vue'
import AdminTodo from '@/components/views/Admin/AdminTodo.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import ToolCard from '@/components/ui/Button/ToolCard.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'
import BillingModal from '@/components/views/Admin/Billing/BillingModal.vue'
import CalendarModal from '@/components/views/Admin/CalendarModal.vue'
import ClientListModal from '@/components/views/Admin/ClientListModal.vue'
import CreateClientModal from '@/components/views/Admin/CreateClientModal.vue'
import CreateMissionModal from '@/components/views/Admin/CreateMissionModal.vue'
import CreateProjectModal from '@/components/views/Admin/CreateProjectModal.vue'
import EnvModal from '@/components/views/Admin/EnvModal.vue'
import SettingsModal from '@/components/views/Admin/SettingsModal.vue'
import SkillsModal from '@/components/views/Admin/SkillsModal.vue'
import TextsModal from '@/components/views/Admin/TextsModal.vue'
import InterestRatesListModal from '@/components/views/Admin/InterestRatesListModal.vue'
import ManualOverrideModal from '@/components/views/Admin/ManualOverrideModal.vue'
import MissionListModal from '@/components/views/Admin/MissionListModal.vue'
import NumberingModal from '@/components/views/Admin/NumberingModal.vue'
import PasswordModal from '@/components/views/Admin/PasswordModal.vue'
import ProjectListModal from '@/components/views/Admin/ProjectListModal.vue'
import UnavailabilityModal from '@/components/views/Admin/UnavailabilityModal.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useMessage } from '@/composables/useMessage.js'

const { getTranslation: t } = useLang()
const site = useSite()

const { logout } = useAuth()
const { translatedMessage, showMessage, clearMessage } = useMessage()

/*
 * Every tool and its modal. The forms (client, mission, project) have no card: their list opens them (emit('open', id, props), opens: true).
 * A new tool: its modal here, its id in a group below, its texts adminXxx / adminHint_<id> (plugins/translations/pages/admin/dashboard.js).
 */
const TOOLS = {
    clients: { opens: true, icon: 'fas fa-users', textKey: 'adminClients', component: ClientListModal },
    client: { textKey: 'adminCreateClients', component: CreateClientModal },
    missions: { opens: true, icon: 'fas fa-tasks', textKey: 'adminMissions', component: MissionListModal },
    mission: { textKey: 'adminCreateMissions', component: CreateMissionModal },
    billing: { icon: 'fas fa-file-invoice-dollar', textKey: 'adminBilling', component: BillingModal },
    numbering: { icon: 'fas fa-hashtag', textKey: 'adminNumbering', component: NumberingModal },
    rates: { icon: 'fas fa-percent', textKey: 'adminInterestRates', component: InterestRatesListModal },
    calendar: { icon: 'fas fa-calendar-alt', textKey: 'adminCalendar', component: CalendarModal },
    unavailability: { icon: 'fas fa-calendar-times', textKey: 'adminUnavailability', component: UnavailabilityModal },
    override: { icon: 'fas fa-toggle-on', textKey: 'adminManualOverride', component: ManualOverrideModal },
    projects: { opens: true, icon: 'fas fa-folder-open', textKey: 'adminProjects', component: ProjectListModal },
    project: { textKey: 'adminCreateProjects', component: CreateProjectModal },
    skills: { icon: 'fas fa-layer-group', textKey: 'adminSkills', component: SkillsModal },
    texts: { icon: 'fas fa-pen-to-square', textKey: 'adminTexts', component: TextsModal },
    settings: { icon: 'fas fa-id-card', textKey: 'adminSettings', component: SettingsModal },
    password: { icon: 'fas fa-key', textKey: 'adminPassword', component: PasswordModal },
    env: { icon: 'fas fa-cog', textKey: 'adminEnvironment', component: EnvModal },
}

// Cards of the dashboard, by task (code: prefix of the cards, TR-01...); the settings only when unfolded
const GROUPS = [
    { key: 'adminGroupWork', code: 'TR', tools: ['billing', 'clients', 'missions'] },
    { key: 'adminGroupSite', code: 'SI', tools: ['projects', 'skills', 'texts', 'calendar', 'unavailability', 'override'] },
    { key: 'adminGroupSettings', code: 'RE', tools: ['settings', 'numbering', 'rates', 'password', 'env'], folded: true },
]
const showSettings = ref(false)
const shownGroups = computed(() => GROUPS.filter(group => !group.folded || showSettings.value))

// The four things made the most: straight to the new document, mission or client
const QUICK = [
    { key: 'adminQuickQuote', icon: 'fas fa-file-signature', tool: 'billing', props: { create: 'quote' }, primary: true },
    { key: 'adminQuickInvoice', icon: 'fas fa-file-invoice', tool: 'billing', props: { create: 'invoice' } },
    { key: 'adminQuickMission', icon: 'fas fa-plus', tool: 'mission', props: {} },
    { key: 'adminQuickClient', icon: 'fas fa-user-plus', tool: 'client', props: {} },
]

// A line of "To do": its document at its next step, or a new invoice of the missions of its client (ticked at once)
const openTodo = (item, e) => item.id
    ? openTool('billing', e, { openId: item.id })
    : openTool('billing', e, { create: 'invoice', clientId: item.clientId, pick: true })
// Read again when a tool closes
const refreshTodo = ref(0)

// The longest word of the names of every card of tools
const toolLetters = computed(() => longestWord(GROUPS.flatMap(group => group.tools.map(id => t(TOOLS[id].textKey)))))

// Open tool, its props, the card it grows from, and the list to come back to when a form closes
const active = ref(null)
const toolProps = shallowRef({})
const returnTo = ref(null)
const activeButton = ref(null)
const loggingOut = ref(false)

const openTool = (id, e, props = {}) => {
    activeButton.value = e?.currentTarget || null
    returnTo.value = null
    toolProps.value = props
    active.value = id
}

// A list opens its form (New / Edit): the list comes back when the form closes
const openFrom = (from, id, props = {}) => {
    returnTo.value = from
    toolProps.value = props
    active.value = id
}

// Closing a form opened from a list goes back to the list; "saved" comes after "close": nothing more to do
const closeTool = () => {
    if (!active.value) return
    const back = returnTo.value
    returnTo.value = null
    toolProps.value = {}
    active.value = back
    if (!back) refreshTodo.value++
}

// Logs out (useAuth redirects to the login page)
const signOut = async () => {
    clearMessage()
    loggingOut.value = true
    const ok = await logout()
    showMessage(ok ? 'success' : 'error', ok ? 'logoutSuccess' : 'logoutError', MESSAGE_DELAY)
    if (!ok) return (loggingOut.value = false)
    // Read first, then home (the button stays busy meanwhile)
    await afterMessage()
    goToPage('/')
}

// How the admin works, in a few steps (adminSection1Title... in plugins/translations/pages/admin/dashboard.js)
const adminSections = Array.from({ length: 5 }, (_, i) => ({ titleKey: `adminSection${i + 1}Title`, contentKey: `adminSection${i + 1}Content` }))
</script>

<style scoped>
.admin-dashboard {
    text-align: left;
}

/* A missing required setting, on a red mark */
.admin-reminder {
    margin: 0 0 2rem;
    padding: 0.9rem 1.1rem;
    border-left: 2px solid #e74c3c;
    background: var(--panel);
    color: #ffb4a8;
}

/* A part of the dashboard: its mint label over a rule, then its cards */
.admin-group {
    margin-bottom: 3.5rem;
}

.admin-group__label {
    margin: 0 0 1.25rem;
    padding-bottom: 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    color: var(--mint);
}

.admin-group:last-of-type {
    margin-bottom: 5rem;
}

/* The four things made the most, under "To do" */
.admin-quick {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 3.5rem;
}

/* Unfolds the settings */
.admin-settings-toggle {
    display: block;
    margin: -1.5rem 0 3.5rem;
    padding: 0;
    border: 0;
    background: none;
    color: var(--accent);
    cursor: pointer;
}

.admin-settings-toggle:hover,
.admin-settings-toggle:focus-visible {
    color: var(--fg);
}

.login-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
