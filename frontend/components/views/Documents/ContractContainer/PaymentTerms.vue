<template>
    <!-- Payment terms article of the contract: amounts, chosen and other options, payment methods -->
    <section class="section">
        <h3 class="section-title text-large text-bold">4. {{ t('paymentTerms') }}</h3>
        <p class="section-text text-small">{{ t('paymentsAccordingToQuote') }}</p>

        <!-- Shows payment details only if totalAmount > 0 -->
        <div v-if="totalAmount > 0" class="payment-details text-small">
            <p class="info-label text-bold">{{ t('financialDetails') }}:</p>
            <div class="info-content">
                {{ t('totalAmount') }}: <span class="amount-value text-bold">{{ formatPrice(totalAmount)
                }}</span><br />

                <!-- Selected payment option -->
                <div class="payment-option-selected">
                    <strong>{{ t('selectedOption') }}:</strong><br />
                    <span v-if="nbMensualites && monthlyPayment">
                        {{ t('monthlyPaymentOption') }}<br />
                        {{ t('numberOfInstallments') }}: <span class="amount-value text-bold">{{ nbMensualites
                        }}</span><br />

                        <div class="bank-transfer-option">
                            <strong>{{ t('bankTransferOption') }}:</strong>
                            <ul class="bullet-list">
                                <li>{{ t('monthlyPayment') }}: <span class="amount-value text-bold">{{
                                    formatPrice(monthlyPayment) }}</span></li>
                                <li>{{ t('noAdditionalFees') }}</li>
                                <li>{{ t('totalOver12Months') }}: <span class="amount-value text-bold">{{
                                    formatPrice(monthlyPayment * nbMensualites) }}</span></li>
                            </ul>
                        </div>
                    </span>
                    <span v-else-if="deposit">
                        {{ t('upfrontPaymentOption') }}<br />
                        {{ t('deposit') }}: <span class="amount-value text-bold">{{ formatPrice(deposit)
                        }}</span>
                        ({{ Math.round((deposit / totalAmount) * 100) }}%)<br />
                        {{ t('remainingBalance') }}: <span class="amount-value text-bold">{{
                            formatPrice(totalAmount - deposit) }}</span>
                    </span>
                    <span v-else-if="serviceType === 'repair'">
                        {{ t('fullPaymentAfterIntervention') }}
                    </span>
                </div>

                <!-- Upfront payment offered as the other option of a web subscription (nothing about installments otherwise) -->
                <div class="payment-option-alternative" v-if="serviceType === 'web' && isSubscription">
                    <strong>{{ t('alternativeOption') }}:</strong><br />
                    <span v-if="nbMensualites && monthlyPayment">
                        {{ t('upfrontPaymentOption') }}<br />
                        {{ t('deposit') }}: <span class="amount-value text-bold">{{ formatPrice(totalAmount *
                            0.30) }}</span> (30%)<br />
                        {{ t('remainingBalance') }}: <span class="amount-value text-bold">{{
                            formatPrice(totalAmount * 0.70) }}</span>
                    </span>
                    <span v-else-if="deposit">
                        {{ t('monthlyPaymentOption') }}<br />
                        {{ t('numberOfInstallments') }}: <span class="amount-value text-bold">12</span><br />

                        <div class="bank-transfer-option">
                            <strong>{{ t('bankTransferOption') }}:</strong>
                            <ul class="bullet-list">
                                <li>{{ t('monthlyPayment') }}: <span class="amount-value text-bold">{{
                                    formatPrice(totalAmount / 12) }}</span></li>
                                <li>{{ t('noAdditionalFees') }}</li>
                                <li>{{ t('totalOver12Months') }}: <span class="amount-value text-bold">{{
                                    formatPrice(totalAmount) }}</span></li>
                            </ul>
                        </div>
                    </span>
                </div>
            </div>
        </div>

        <!-- Free schedule of the quote: every step, its share, its date and its amount -->
        <table v-if="steps.length > 2 && !nbMensualites" class="steps-table text-small">
            <tr v-for="step in steps" :key="step.key">
                <td>{{ step.label && !['deposit', 'balance', 'full'].includes(step.label) ? step.label : t(`billStep_${step.kind}`) }}</td>
                <td>{{ step.percent }} %</td>
                <td>{{ step.dueDate ? longDate(step.dueDate) : t('billOnDelivery') }}</td>
                <td class="text-bold">{{ formatPrice(step.amount) }}</td>
            </tr>
        </table>

        <!-- Direct Debit Authorization Clause -->
        <div v-if="nbMensualites && monthlyPayment && serviceType === 'web'" class="automatic-debit-section text-small">
            <p class="section-subtitle text-bold"><strong>{{ t('automaticDebitAuth') }}</strong></p>
            <p class="section-text">
                {{ t('automaticDebitInfo', {
                    amount: formatPrice(monthlyPayment)
                }) }}
            </p>
            <p class="section-text">
                {{ t('debitDate') }}<br />
                {{ t('automaticEnd') }}
            </p>
            <p class="section-subtitle text-bold"><strong>{{ t('paymentFailureProcess') }}:</strong></p>
            <ul class="bullet-list">
                <li>{{ t('retryAttempts') }}</li>
                <li>{{ t('automaticReminder') }}</li>
                <li>{{ t('after4Failures') }}</li>
                <li>{{ t('after30Days') }}</li>
            </ul>
        </div>

        <!-- Available payment methods -->
        <p class="section-text text-small">{{ t('paymentCanBeMade') }}:</p>
        <ul class="bullet-list text-small">
            <li>{{ t('paymentByCard') }} <a :href="`${websiteUrl}/pay-me`" :title="`${websiteUrl}/pay-me`">{{ websiteUrl
            }}/pay-me</a></li>
            <!-- By transfer: only when the bank details are known (admin > Environment) -->
            <li v-if="providerInfo.bank?.iban">{{ t('paymentByBankTransfer', { iban: providerInfo.bank.iban, bic: providerInfo.bank.bic || '—' }) }}</li>
            <li>{{ t('paymentOtherMeans') }}</li>
        </ul>
    </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import { useLang } from '@/composables/useLang'

const lang = useLang()
const t = lang.getTranslation
// Date of a step: "1 décembre 2026"
const longDate = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString(lang.current.value === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

defineProps({
    totalAmount: { type: Number, default: 0 },
    deposit: Number,
    nbMensualites: Number,
    // Paid in monthly installments (Stripe subscription)
    isSubscription: Boolean,
    monthlyPayment: Number,
    serviceType: { type: String, default: '' },
    formatPrice: Function,
    websiteUrl: String,
    providerInfo: { type: Object as PropType<Record<string, any>>, required: true },
    // Steps of a free schedule (utils/billing.js planSteps)
    steps: { type: Array as PropType<Record<string, any>[]>, default: () => [] },
})
</script>

<style scoped>
/* Amount and payment method chosen */
.payment-details {
    background: #1b1d21;
    padding: 16px;
    margin-bottom: 16px
}

/* Chosen option highlighted, the other ones faded */
.payment-option-selected {
    background: #1c2926;
    padding: 12px;
    margin: 12px 0
}

.payment-option-alternative {
    background: #232216;
    padding: 12px;
    margin: 12px 0;
    opacity: 0.8
}

.payment-option-selected strong,
.payment-option-alternative strong {
    color: #7ee6a8
}

/* Bank details for a transfer */
.bank-transfer-option {
    background: #221c2a;
    padding: 10px;
    margin: 10px 0
}

.automatic-debit-section {
    background: #232216;
    padding: 16px;
    margin: 16px 0
}

.section-subtitle {
    color: #7ee6a8;
    margin: 12px 0 8px 0
}

/* Shorter list inside the bank transfer box */
.bank-transfer-option .bullet-list {
    margin: 8px 0 0 0;
    padding-left: 20px
}

.bank-transfer-option .bullet-list li {
    margin-bottom: 4px
}
</style>
