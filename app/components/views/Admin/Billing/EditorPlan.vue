<!-- How the total will be paid: at once, a deposit then the balance, a free schedule, or monthly payments.
The steps and their amounts are shown under the choice (utils/billing.js planSteps) -->
<template>
    <section class="editor-plan">
        <p class="eyebrow">{{ t('billPayment') }}</p>

        <div class="editor-plan__modes" role="radiogroup" :aria-label="t('billPayment')">
            <button v-for="mode in MODES" :key="mode" type="button" role="radio" class="editor-plan__mode text-label"
                :class="{ 'is-active': plan.mode === mode }" :aria-checked="plan.mode === mode" @click="setMode(mode)">
                {{ t(`billMode_${mode}`) }}
            </button>
        </div>

        <!-- Deposit: a percent or an amount, the date of the balance -->
        <div v-if="plan.mode === 'deposit'" class="row-group">
            <div class="form-group">
                <label for="plan-deposit-type">{{ t('billStep_deposit') }}</label>
                <select id="plan-deposit-type" v-model="plan.deposit.type" @change="update">
                    <option value="percent">{{ t('billPercent') }}</option>
                    <option value="amount">{{ t('billAmount') }}</option>
                </select>
            </div>
            <div class="form-group">
                <label for="plan-deposit-value">{{ plan.deposit.type === 'percent' ? t('billPercent') : t('billAmount') }}</label>
                <input id="plan-deposit-value" v-model.number="plan.deposit.value" type="number" min="0" step="0.01" @input="update" />
            </div>
            <div class="form-group">
                <label for="plan-balance-date">{{ t('billBalanceDate') }}</label>
                <input id="plan-balance-date" v-model="plan.balanceDate" type="date" @input="update" />
            </div>
        </div>

        <!-- Free schedule: one row per step, the last one takes what remains -->
        <div v-if="plan.mode === 'schedule'" class="editor-plan__rows">
            <div v-for="(row, i) in plan.schedule" :key="i" class="editor-plan__row">
                <input v-model="row.label" type="text" :placeholder="t('billStepLabel')" :aria-label="t('billStepLabel')" @input="update" />
                <select v-model="row.type" :aria-label="t('billAmount')" @change="update">
                    <option value="percent">%</option>
                    <option value="amount">{{ currency }}</option>
                </select>
                <input v-model.number="row.value" type="number" min="0" step="0.01" :disabled="i === plan.schedule.length - 1"
                    :aria-label="t('billAmount')" @input="update" />
                <input v-model="row.dueDate" type="date" :aria-label="t('billDueDate')" @input="update" />
                <IconButton icon="trash" variant="danger" :label="t('billRemoveLine')" @click="removeRow(i)" />
            </div>
            <HeroButton iconClass="fas fa-plus" :label="t('billAddStep')" @click="addRow" />
        </div>

        <!-- Monthly payments: how many, from when -->
        <div v-if="plan.mode === 'monthly'" class="row-group">
            <div class="form-group">
                <label for="plan-months">{{ t('billMonths') }}</label>
                <input id="plan-months" v-model.number="plan.months" type="number" min="2" max="36" @input="update" />
            </div>
            <div class="form-group">
                <label for="plan-first">{{ t('billFirstDate') }}</label>
                <input id="plan-first" v-model="plan.firstDate" type="date" @input="update" />
            </div>
        </div>

        <!-- The steps, as they will be printed -->
        <ol v-if="steps.length > 1" class="editor-plan__steps">
            <li v-for="step in steps" :key="step.key">
                <span class="text-label">{{ step.label && !['deposit', 'balance', 'full'].includes(step.label) ? step.label : t(`billStep_${step.kind}`) }}</span>
                <span class="text-body-s">{{ step.percent }} %<template v-if="step.dueDate"> · {{ step.dueDate }}</template></span>
                <strong class="text-body">{{ money(step.amount) }}</strong>
            </li>
        </ol>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import IconButton from '@/components/ui/Button/IconButton.vue'
import { useLang } from '@/composables/useLang.js'
import { planSteps } from '@/utils/billing.js'

const plan = defineModel({ type: Object, default: () => ({ mode: 'full' }) })
const props = defineProps({
    total: { type: Number, default: 0 },
    issueDate: { type: String, default: '' },
    currency: { type: String, default: 'EUR' },
})

const lang = useLang()
const t = lang.getTranslation
const MODES = ['full', 'deposit', 'schedule', 'monthly']
const money = value => new Intl.NumberFormat(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency: props.currency }).format(Number(value) || 0)
const steps = computed(() => planSteps(plan.value, props.total, props.issueDate))

// A new object tells the parent (preview, totals)
const update = () => { plan.value = { ...plan.value } }

// Each mode starts with useful values: 30 % deposit, 3 steps of 40 / 30 / 30 %, 12 months from the issue date
const setMode = mode => {
    const base = { ...plan.value, mode }
    if (mode === 'deposit' && !base.deposit) base.deposit = { type: 'percent', value: 30 }
    if (mode === 'schedule' && !base.schedule?.length) base.schedule = [
        { label: '', type: 'percent', value: 40, dueDate: '' }, { label: '', type: 'percent', value: 30, dueDate: '' }, { label: '', type: 'percent', value: 30, dueDate: '' },
    ]
    if (mode === 'monthly') {
        base.months = base.months || 12
        base.firstDate = base.firstDate || props.issueDate
    }
    plan.value = base
}

const addRow = () => {
    plan.value = { ...plan.value, schedule: [...plan.value.schedule, { label: '', type: 'percent', value: 0, dueDate: '' }] }
}
const removeRow = i => {
    plan.value = { ...plan.value, schedule: plan.value.schedule.filter((_, j) => j !== i) }
}
</script>
