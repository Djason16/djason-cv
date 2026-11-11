<!-- The path of a finalized quote, always in the same order (the order of the terms): 1. the quote, 2. its contract
(made and finalized in one click, or none: advised or not from the quote), 3. both given together (two PDF) and signed by the client, 4. the payments (deposit, installments, balance: each one invoiced when paid), then done.
Each step done is ticked; only the step of now shows its buttons. A payment online (link, automatic debit) moves it alone. -->
<template>
    <section class="billing-flow">
        <p class="eyebrow">{{ t('flowTitle') }}</p>
        <ol class="billing-flow__steps">
            <li v-for="(stage, i) in stages" :key="stage.key" class="billing-flow__step"
                :class="{ 'is-done': stage.done, 'is-current': stage.key === current, 'is-refused': refused && stage.key === 'sign' }">
                <span class="billing-flow__mark text-label" aria-hidden="true">{{ stage.done ? '✓' : String(i + 1).padStart(2, '0') }}</span>
                <div class="billing-flow__body">
                    <p class="billing-flow__name text-body">{{ t(`flowStep_${stage.key}`) }}</p>
                    <p class="billing-flow__state text-body-s">{{ stage.state }}</p>

                    <!-- 2. The contract: made from the quote (its service), then finalized -->
                    <div v-if="stage.key === 'contract' && current === 'contract'" class="billing-flow__actions">
                        <template v-if="!contract">
                            <!-- Advised or not, from the quote: several payments or a large amount -->
                            <p class="billing-flow__hint text-body-s" :class="{ 'is-on': advice.length }">
                                {{ advice.length ? t('flowContractAdvised', { reasons: advice.join(', ') }) : t('flowContractOptional') }}
                            </p>
                            <select v-model="serviceType" :aria-label="t('billServiceType')">
                                <option v-for="s in ['web', 'video', 'repair']" :key="s" :value="s">{{ t(`service_${s}`) }}</option>
                            </select>
                            <HeroButton :primary="Boolean(advice.length)" iconClass="fas fa-file-signature" :label="t('billCreateContract')" :disabled="busy" @click="createContract" />
                            <HeroButton :primary="!advice.length" iconClass="fas fa-forward" :label="t('flowNoContractChoice')" :disabled="busy" @click="chooseNoContract(true)" />
                        </template>
                        <template v-else>
                            <HeroButton primary iconClass="fas fa-lock" :label="t('flowFinalizeContract')" :disabled="busy" @click="finalizeContract(contract)" />
                            <HeroButton iconClass="fas fa-pen" :label="t('flowOpenContract')" @click="emit('open', contract.id)" />
                        </template>
                    </div>

                    <!-- 3. Sent together, signed together -->
                    <!-- No contract chosen: it can still be added until the signature -->
                    <div v-if="stage.key === 'contract' && noContract && current === 'sign' && !refused" class="billing-flow__actions">
                        <button type="button" class="billing-actions__link text-label" :disabled="busy" @click="chooseNoContract(false)">{{ t('flowAddContract') }}</button>
                    </div>

                    <div v-if="stage.key === 'sign' && current === 'sign'" class="billing-flow__actions">
                        <p class="billing-flow__hint text-body-s">{{ t(contract ? 'flowSignHint' : 'flowSignHintQuote') }}</p>
                        <!-- The quote and its contract downloaded together (one file each), given at the same time as the terms say -->
                        <!-- By email, both attached in one email; or downloaded, to send them another way -->
                        <HeroButton iconClass="fas fa-paper-plane" :label="t(contract ? 'flowMailBoth' : 'flowMailQuote')" :disabled="busy" @click="mailForSignature" />
                        <HeroButton v-if="contract" iconClass="fas fa-download" :label="t('flowBothPdf')" :disabled="busy" @click="emit('download-both', contract)" />
                        <HeroButton v-else iconClass="fas fa-download" :label="t('flowQuotePdf')" :disabled="busy" @click="emit('download')" />
                        <p v-if="doc.options?.mailedAt" class="billing-flow__hint is-on text-body-s">{{ t('billMailedAt', { date: sentDate(doc.options.mailedAt) }) }}</p>
                        <HeroButton primary iconClass="fas fa-signature" :label="t(contract ? 'flowSigned' : 'flowSignedQuote')" :disabled="busy" @click="markSigned" />
                        <HeroButton iconClass="fas fa-times" :label="t('billMarkRefused')" :disabled="busy" @click="refuse" />
                    </div>

                    <!-- 4. Every step of the plan: paid, invoiced, or to pay (online with the link, or by hand) -->
                    <template v-if="stage.key === 'pay' && (current === 'pay' || stage.done)">
                        <ul class="billing-flow__plan">
                            <li v-for="step in plan" :key="step.key" :class="{ 'is-paid': step.paid, 'is-next': step.key === nextStep?.key }">
                                <span class="text-label">{{ stepName(step) }}<template v-if="step.dueDate"> · {{ date(step.dueDate) }}</template></span>
                                <span class="text-body">{{ money(step.amount) }}</span>
                                <button v-if="step.invoice" type="button" class="billing-actions__link text-label" @click="emit('open', step.invoice.id)">
                                    {{ step.invoice.number || t('billDraft') }} {{ step.paid ? '✓' : '→' }}
                                </button>
                                <span v-else class="text-label billing-flow__todo">{{ t('flowToPay') }}</span>
                            </li>
                        </ul>
                        <p v-if="autopay" class="billing-flow__hint text-body-s" :class="{ 'is-on': autopay.active, 'is-error': autopay.error }">
                            {{ t(autopay.active ? 'autopayOn' : 'autopayOff', { card: autopay.card || '' }) }}
                            <template v-if="autopay.error"> · {{ t('autopayRefused', { reason: autopay.error }) }}</template>
                        </p>
                        <div v-if="nextStep" class="billing-flow__actions">
                            <p class="billing-flow__hint text-body-s">{{ t('flowPayHint', { step: stepName(nextStep), amount: money(nextStep.remaining) }) }}</p>
                            <HeroButton primary iconClass="fas fa-link" :label="t('flowCopyLink')" :disabled="busy" @click="copyLink" />
                            <HeroButton v-if="autopay?.active" iconClass="fas fa-stop" :label="t('autopayStop')" :disabled="busy" @click="stopAutopay" />
                        </div>
                        <!-- A payment received another way (transfer, cash, cheque...): its invoice made only now, paid at once -->
                        <form v-if="nextStep" class="billing-flow__received" @submit.prevent="received">
                            <p class="billing-flow__received-title eyebrow">{{ t('flowReceivedTitle') }}</p>
                            <div class="billing-flow__received-fields">
                                <div class="form-group">
                                    <label for="received-date">{{ t('billPaymentDate') }}</label>
                                    <input id="received-date" v-model="payment.date" type="date" required />
                                </div>
                                <div class="form-group">
                                    <label for="received-amount">{{ t('billPaymentAmount') }}</label>
                                    <input id="received-amount" v-model.number="payment.amount" type="number" min="0.01" step="0.01" required />
                                </div>
                                <div class="form-group">
                                    <label for="received-method">{{ t('billPaymentMethod') }}</label>
                                    <select id="received-method" v-model="payment.method">
                                        <option v-for="m in ['transfer', 'cash', 'check', 'card', 'other']" :key="m" :value="m">{{ t(`billMethod_${m}`) }}</option>
                                    </select>
                                </div>
                            </div>
                            <HeroButton type="submit" primary iconClass="fas fa-check" :label="t('flowReceivedSave')" :disabled="busy" />
                        </form>
                    </template>
                </div>
            </li>
        </ol>
    </section>
</template>

<script setup lang="ts">
import type { ApiResult } from '@/utils/api'
import type { BillingDocument } from '@/utils/billing'
import type { PropType } from 'vue'
import { computed, reactive, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import { useInterestRates } from '@/composables/useInterestRates'
import { useLang } from '@/composables/useLang'
import { useBillingStore } from '@/stores/billing'
import { useSiteSettingsStore } from '@/stores/siteSettings'
import { nextNumber } from '@/utils/numbering'
import { quoteProgress } from '@/utils/quoteProgress'
import { useDocumentMail } from '@/composables/useDocumentMail'
import { showConfirm, showFailure, showSuccess } from '@/utils/dialog'
import { currentTimeZone, todayIso } from '@/utils/display'

const props = defineProps({
    doc: { type: Object as PropType<BillingDocument>, required: true },
    busy: Boolean,
})
const emit = defineEmits(['download', 'download-both', 'open', 'busy'])
const lang = useLang()
const t = lang.getTranslation
const billing = useBillingStore()
const siteSettings = useSiteSettingsStore()
const { getApplicableRate } = useInterestRates()

const locale = computed(() => lang.current.value === 'fr' ? 'fr-FR' : 'en-GB')
const money = (value: any) => new Intl.NumberFormat(locale.value, { style: 'currency', currency: props.doc.currency || 'EUR' }).format(Number(value) || 0)
const date = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
const stepName = (step: Record<string, any>) => /^\d+\/\d+$/.test(step.label) ? `${t('billStep_installment')} ${step.label}`
    : step.label && !['deposit', 'balance', 'full'].includes(step.label) ? step.label : t(`billStep_${step.kind}`)

// The documents made from this quote, and where each step of its plan stands
const progress = computed(() => quoteProgress(props.doc, billing.documents))
const contract = computed(() => progress.value.contract)
const plan = computed(() => progress.value.plan)
const nextStep = computed(() => progress.value.nextStep)
const refused = computed(() => progress.value.refused)
const signed = computed(() => progress.value.signed)
const autopay = computed(() => props.doc.options?.autopay || null)
const noContract = computed(() => progress.value.noContract)

// A contract is advised for a payment in several steps or a large amount; else the signed quote and the terms are enough
const CONTRACT_FROM = 1500
const advice = computed(() => [
    plan.value.length > 1 && t('flowReasonSteps', { count: plan.value.length }),
    Number(props.doc.totalTTC) >= CONTRACT_FROM && t('flowReasonAmount', { amount: money(CONTRACT_FROM) }),
].filter(Boolean))

// The four steps, and the first one not done (nothing more after a refusal)
const stages = computed(() => {
    const paid = plan.value.filter(s => s.paid).length
    return [
        { key: 'quote', done: true, state: props.doc.number },
        { key: 'contract', done: progress.value.contractDone,
            state: contract.value ? `${contract.value.number || t('billDraft')}${contract.value.status === 'accepted' ? ` · ${t('billState_signed')}` : ''}`
                : noContract.value ? t('flowNoContractState') : t('flowNoContract') },
        { key: 'sign', done: signed.value, state: refused.value ? t('billState_refused') : signed.value ? t('flowSignedState') : t('flowWaitingSign') },
        { key: 'pay', done: Boolean(plan.value.length) && !nextStep.value, state: t('flowPaidCount', { paid, total: plan.value.length }) },
    ]
})
const current = computed(() => progress.value.current === 'refused' ? 'sign' : progress.value.current)

// Runs an action of the store, shows its result
const run = async (action: () => Promise<ApiResult>, opened = false) => {
    emit('busy', true)
    const res = await action()
    emit('busy', false)
    if (!res.success) return showFailure(res.error || t('billError')), null
    showSuccess(t('billSaved'))
    if (opened) emit('open', res.document.id)
    return res
}

// The contract made from the quote and finalized at once (its number: the next one of its series, admin → Numbering)
const serviceType = ref('web')
const finalizeContract = async (draft: BillingDocument) => {
    const used = billing.documents.filter(d => d.type === 'contract' && d.number).map(d => d.number)
    return run(() => billing.finalize(draft.id, nextNumber('contract', todayIso(), siteSettings.values.numbering, used)))
}
const createContract = async () => {
    const made = await run(() => billing.createContract(props.doc.id, {
        serviceType: serviceType.value, interestRate: getApplicableRate(props.doc.client?.type ?? '', todayIso()),
    }))
    if (made?.document) await finalizeContract(made.document)
}

// No contract (the signed quote is enough), or one again
const chooseNoContract = (none: boolean) => run(() => billing.contractChoice(props.doc.id, none))

// The quote and its contract signed together
const markSigned = async () => {
    const res = await run(() => billing.setStatus(props.doc.id, 'accepted'))
    if (res && contract.value && contract.value.status === 'final') await billing.setStatus(contract.value.id, 'accepted')
}
const refuse = async () => {
    if (await showConfirm(t('flowRefuseConfirm'))) run(() => billing.setStatus(props.doc.id, 'refused'))
}

// The payment link of the quote: it always shows the next step to pay
const copyLink = async () => {
    emit('busy', true)
    const res = props.doc.payToken ? { success: true } : await billing.payLink(props.doc.id)
    emit('busy', false)
    if (!res.success) return showFailure(res.error || t('billError'))
    const url = `${useRuntimeConfig().public.frontendDomain}/pay-me/?doc=${props.doc.payToken || res.token}`
    try {
        await navigator.clipboard.writeText(url)
        showSuccess(t('payLinkCopied'))
    } catch {
        showSuccess(url)
    }
}

// A payment received by transfer, cash...: the invoice of the step made now (or the one already made), numbered, then the payment on it
const payment = reactive({ date: todayIso(), amount: 0, method: 'transfer' })
watch(() => nextStep.value?.key, () => Object.assign(payment, { date: todayIso(), amount: nextStep.value?.remaining || 0, method: 'transfer' }), { immediate: true })
const received = async () => {
    // What was typed, kept as it is while the invoice is made (the list of the documents changes meanwhile)
    const entry = { ...payment }
    const step = nextStep.value
    if (!step) return
    let invoice: BillingDocument | null = step.invoice
    if (!invoice) {
        const label = step.kind === 'deposit' ? t('billDepositLine', { percent: step.percent, number: props.doc.number ?? '' })
            : step.kind === 'installment' ? t('billInstallmentLine', { label: stepName(step), number: props.doc.number ?? '' }) : ''
        const made = await run(() => billing.createInvoice(props.doc.id, step.key, label))
        if (!made) return
        invoice = made.document
    }
    if (!invoice) return
    const doc = invoice
    if (doc.status === 'draft') {
        // Issued today; the day the money came in printed as the date of the deposit / of the service (a payment entered later)
        const dated = await run(() => billing.save({ id: doc.id, options: { ...(doc.options || {}), serviceDate: entry.date } }))
        if (!dated) return
        const used = billing.documents.filter(d => d.type === 'invoice' && d.number).map(d => d.number)
        const done = await run(() => billing.finalize(doc.id, nextNumber('invoice', todayIso(), siteSettings.values.numbering, used)))
        if (!done) return
    }
    const paid = await run(() => billing.addPayment(doc.id, { ...entry, note: '' }))
    // The client gets the invoice by email at once, with a thank you
    if (paid?.document && props.doc.client?.email) mailed(await documentMail.send([paid.document], 'paid'))
}

// The quote (and its contract) sent to the client to sign, both attached in one email
const documentMail = useDocumentMail()
const mailed = (res: ApiResult) => res.success ? showSuccess(t('billMailSent', { email: res.sentTo })) : showFailure(t(res.error || 'billMailFailed'))
const sentDate = (iso: string) => new Date(iso).toLocaleString(locale.value, { dateStyle: 'medium', timeStyle: 'short', timeZone: currentTimeZone() })
const mailForSignature = async () => {
    const email = props.doc.client?.email
    if (!email) return showFailure(t('billMailNoEmail'))
    if (!(await showConfirm(t('billMailConfirm', { number: [props.doc.number, contract.value?.number].filter(Boolean).join(' + '), email })))) return
    emit('busy', true)
    const res = await documentMail.send(contract.value ? [props.doc, contract.value] : [props.doc], 'documents')
    emit('busy', false)
    mailed(res)
}

const stopAutopay = async () => {
    if (await showConfirm(t('autopayStopConfirm'))) run(() => billing.autopayStop(props.doc.id))
}
</script>
