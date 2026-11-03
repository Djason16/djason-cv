<!-- Top of the admin dashboard: what waits for you (utils/billingTodo.js) as a board of four steps, in the order of the work:
to finalize, to get signed, to collect, to invoice. Each step: its count or its amount in large mint letters, then its lines
(one click opens the document at its next step, or the invoice of the missions of a client). Then what the server does alone.
Style: admin-todo.css -->
<template>
    <section class="admin-todo">
        <p class="admin-group__label eyebrow">{{ t('adminTodoTitle') }}</p>

        <div class="admin-todo__board">
            <div v-for="(column, c) in columns" :key="column.key" class="admin-todo__column" :class="{ 'is-empty': !column.items.length }">
                <p class="admin-todo__head eyebrow">{{ padIndex(c) }} — {{ t(`adminTodo_${column.key}`) }}</p>
                <p class="admin-todo__figure text-display-s">{{ loading ? '…' : column.figure }}</p>

                <ul v-if="column.items.length" class="admin-todo__list">
                    <li v-for="item in column.shown" :key="item.id || `m-${item.clientId}`">
                        <button type="button" class="admin-todo__item" @click="e => emit('open', item, e)">
                            <span class="admin-todo__client text-body">{{ item.clientName }}</span>
                            <span class="admin-todo__meta text-body-s">{{ item.kind === 'missions' ? item.step : item.number || t('billDraft') }} · {{ item.amount }}</span>
                            <span class="admin-todo__go" aria-hidden="true">→</span>
                        </button>
                    </li>
                </ul>
                <p v-else-if="!loading" class="admin-todo__none text-body-s">{{ t('adminTodoNone') }}</p>
                <button v-if="column.items.length > SHOWN" type="button" class="admin-todo__more text-label" @click="open[column.key] = !open[column.key]">
                    {{ open[column.key] ? t('adminTodoLess') : t('adminTodoMore', { count: column.items.length - SHOWN }) }}
                </button>
            </div>
        </div>

        <!-- Alone: the invoice after a payment online, the reminders every day -->
        <p class="admin-todo__auto text-body-s">
            <span class="admin-todo__dot" aria-hidden="true"></span>
            <span>{{ t('adminAutoHint') }}<template v-if="last?.at"> · {{ t('adminAutoLast', { date: when(last.at), count: sentToday }) }}</template></span>
            <button type="button" class="admin-todo__run text-label" :disabled="running" @click="runNow">{{ t(running ? 'loading' : 'adminAutoRun') }}</button>
        </p>
    </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useLang } from '@/composables/useLang.js'
import { useAdminDataStore } from '@/stores/adminData.js'
import { useBillingStore } from '@/stores/billing.js'
import { billingTodo } from '@/utils/billingTodo.js'
import { showFailure, showSuccess } from '@/utils/dialog.js'
import { currentTimeZone, padIndex } from '@/utils/display.js'

// Changed by the dashboard when a tool closes: everything read again
const props = defineProps({ refresh: { type: Number, default: 0 } })
const emit = defineEmits(['open'])
const lang = useLang()
const t = lang.getTranslation
const billing = useBillingStore()
const adminData = useAdminDataStore()

const locale = computed(() => lang.current.value === 'fr' ? 'fr-FR' : 'en-GB')
const money = (value, currency = 'EUR') => new Intl.NumberFormat(locale.value, { style: 'currency', currency }).format(Number(value) || 0)
const when = iso => new Date(iso).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short', timeZone: currentTimeZone() })

const loading = ref(true)
const items = computed(() => billingTodo(billing.documents, adminData.missions || [], adminData.clients || [], { t, money }))

// The four steps of the work, each with its kinds; a figure: how many to finalize or to sign, how much to collect or to invoice
const STEPS = [
    { key: 'finalize', kinds: ['draft'], count: true },
    { key: 'sign', kinds: ['contract', 'sign'], count: true },
    { key: 'collect', kinds: ['pay'] },
    { key: 'invoice', kinds: ['missions'] },
]
const SHOWN = 4
const open = reactive({})
const columns = computed(() => STEPS.map(step => {
    const list = items.value.filter(item => step.kinds.includes(item.kind))
    const figure = step.count ? String(list.length) : money(list.reduce((sum, item) => sum + item.value, 0))
    return { ...step, items: list, figure, shown: open[step.key] ? list : list.slice(0, SHOWN) }
}))

// The last run of the automatic tasks, and the emails it sent
const last = ref(null)
const sentToday = computed(() => [...(last.value?.pending || []), ...(last.value?.reminders || [])].filter(r => r.sent).length)
const loadLast = async () => {
    const res = await billing.tasks()
    if (res.success) last.value = res.last
}
const running = ref(false)
const runNow = async () => {
    running.value = true
    const res = await billing.tasks(true)
    running.value = false
    if (!res.success) return showFailure(t('billError'))
    last.value = res
    await billing.load(true)
    showSuccess(t('adminAutoDone', { count: sentToday.value }))
}

// Loaded with the dashboard, again when a tool closes (a document, a mission changed)
const load = async (again = false) => {
    if (again) adminData.invalidate('missions', 'clients')
    await Promise.all([billing.load(again), adminData.load('clients', 'missions'), loadLast()])
    loading.value = false
}
onMounted(() => load())
watch(() => props.refresh, () => load(true))
</script>
