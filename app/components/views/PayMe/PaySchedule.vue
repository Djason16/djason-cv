<template>
    <!-- Steps of the payment plan of a quote, on the Pay me page (PayDocument): each one numbered, its date and amount,
         paid (mint tick), the one paid now (mint mark), the next ones (quiet) -->
    <ol class="pay-schedule">
        <li v-for="(step, i) in steps" :key="step.key" class="pay-schedule__step"
            :class="{ 'is-paid': step.paid, 'is-current': step.key === current }">
            <span class="pay-schedule__index eyebrow">{{ step.paid ? '✓' : padIndex(i) }}</span>
            <span class="pay-schedule__name text-body-s">
                {{ nameOf(step) }}
                <small v-if="step.dueDate" class="pay-schedule__date text-body-s">{{ date(step.dueDate) }}</small>
            </span>
            <span class="pay-schedule__amount text-body">{{ money(step.amount) }}</span>
            <span class="pay-schedule__state text-label">{{ t(step.paid ? 'payDocStepPaid' : step.key === current ? 'payDocStepNow' : 'payDocStepLater') }}</span>
        </li>
    </ol>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { padIndex } from '@/utils/display.js'

defineProps({
    steps: { type: Array, required: true },
    // Key of the step paid now
    current: { type: String, default: '' },
    money: { type: Function, required: true },
})
const lang = useLang()
const t = lang.getTranslation
const date = iso => new Date(`${iso}T12:00:00`).toLocaleDateString(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
// "Installment 2/3", "Deposit", or the name given in the schedule of the quote
const nameOf = step => /^\d+\/\d+$/.test(step.label) ? `${t('billStep_installment')} ${step.label}`
    : step.label && !['deposit', 'balance', 'full'].includes(step.label) ? step.label : t(`billStep_${step.kind}`)
</script>

<style scoped>
.pay-schedule {
    margin: 0.5rem 0 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid var(--line);
}

.pay-schedule__step {
    display: grid;
    grid-template-columns: 2.25rem minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 0.75rem;
    padding: 0.7rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    color: var(--fg-muted);
}

.pay-schedule__index {
    color: var(--fg-muted);
}

.pay-schedule__name {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.pay-schedule__date {
    color: var(--fg-muted);
}

.pay-schedule__state {
    min-width: 5.5rem;
    text-align: right;
}

/* Paid: the tick and the word in mint */
.pay-schedule__step.is-paid .pay-schedule__index,
.pay-schedule__step.is-paid .pay-schedule__state {
    color: var(--accent);
}

/* Paid now: a mint line on its left, in full light */
.pay-schedule__step.is-current {
    color: var(--fg);
    box-shadow: inset 2px 0 0 var(--accent);
    padding-left: 0.6rem;
}

.pay-schedule__step.is-current .pay-schedule__index,
.pay-schedule__step.is-current .pay-schedule__state {
    color: var(--accent);
}

@media (max-width: 560px) {
    .pay-schedule__step {
        grid-template-columns: 2rem minmax(0, 1fr) auto;
    }

    .pay-schedule__state {
        display: none;
    }
}
</style>
