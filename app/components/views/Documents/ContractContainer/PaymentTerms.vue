<template>
    <!-- Payment terms article of the contract: amounts, chosen and other options, payment methods -->
    <section class="section">
        <h3 class="section-title text-large text-bold">4. {{ t('paymentTerms') }}</h3>
        <p class="section-text text-small">{{ t('paymentsAccordingToQuote') }}</p>

        <!-- Shows payment details only if totalAmount > 0 -->
        <div v-if="totalAmount > 0" class="payment-details text-small">
            <p class="info-label">{{ t('financialDetails') }}:</p>
            <div class="info-content">
                {{ t('totalAmount') }}: <span class="amount-value">{{ formatPrice(totalAmount)
                }}</span><br />

                <!-- Selected payment option -->
                <div class="payment-option-selected">
                    <strong>{{ t('selectedOption') }}:</strong><br />
                    <span v-if="nbMensualites && monthlyPayment">
                        {{ t('monthlyPaymentOption') }}<br />
                        {{ t('numberOfInstallments') }}: <span class="amount-value">{{ nbMensualites
                        }}</span><br />

                        <StripeFeesList :netAmount="monthlyPayment" :months="nbMensualites"
                            :calculateStripeFees="calculateStripeFees" :formatPrice="formatPrice" />

                        <div class="bank-transfer-option">
                            <strong>{{ t('bankTransferOption') }}:</strong>
                            <ul class="bullet-list">
                                <li>{{ t('monthlyPayment') }}: <span class="amount-value">{{
                                    formatPrice(monthlyPayment) }}</span></li>
                                <li>{{ t('noAdditionalFees') }}</li>
                                <li>{{ t('totalOver12Months') }}: <span class="amount-value">{{
                                    formatPrice(monthlyPayment * nbMensualites) }}</span></li>
                            </ul>
                        </div>
                    </span>
                    <span v-else-if="deposit">
                        {{ t('upfrontPaymentOption') }}<br />
                        {{ t('deposit') }}: <span class="amount-value">{{ formatPrice(deposit)
                        }}</span>
                        ({{ Math.round((deposit / totalAmount) * 100) }}%)<br />
                        {{ t('remainingBalance') }}: <span class="amount-value">{{
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
                        {{ t('deposit') }}: <span class="amount-value">{{ formatPrice(totalAmount *
                            0.30) }}</span> (30%)<br />
                        {{ t('remainingBalance') }}: <span class="amount-value">{{
                            formatPrice(totalAmount * 0.70) }}</span>
                    </span>
                    <span v-else-if="deposit">
                        {{ t('monthlyPaymentOption') }}<br />
                        {{ t('numberOfInstallments') }}: <span class="amount-value">12</span><br />

                        <StripeFeesList :netAmount="totalAmount / 12" :months="12"
                            :calculateStripeFees="calculateStripeFees" :formatPrice="formatPrice" />

                        <div class="bank-transfer-option">
                            <strong>{{ t('bankTransferOption') }}:</strong>
                            <ul class="bullet-list">
                                <li>{{ t('monthlyPayment') }}: <span class="amount-value">{{
                                    formatPrice(totalAmount / 12) }}</span></li>
                                <li>{{ t('noAdditionalFees') }}</li>
                                <li>{{ t('totalOver12Months') }}: <span class="amount-value">{{
                                    formatPrice(totalAmount) }}</span></li>
                            </ul>
                        </div>
                    </span>
                </div>
            </div>
        </div>

        <!-- Direct Debit Authorization Clause -->
        <div v-if="nbMensualites && monthlyPayment && serviceType === 'web'" class="automatic-debit-section text-small">
            <p class="section-subtitle"><strong>{{ t('automaticDebitAuth') }}</strong></p>
            <p class="section-text">
                {{ t('automaticDebitInfo', {
                    amount: formatPrice(calculateStripeFees(monthlyPayment, 'european').total)
                }) }}
            </p>
            <p class="section-text">
                {{ t('debitDate') }}<br />
                {{ t('automaticEnd') }}
            </p>
            <p class="section-subtitle"><strong>{{ t('paymentFailureProcess') }}:</strong></p>
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
            <li>{{ t('paymentByCard') }} <a :href="`${websiteUrl}/pay-me`">{{ websiteUrl
            }}/pay-me</a></li>
            <li>{{ t('paymentByBankTransfer', {
                iban: providerInfo.bank.iban, bic:
                    providerInfo.bank.bic
            }) }}</li>
            <li>{{ t('paymentOtherMeans') }}</li>
        </ul>
    </section>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import StripeFeesList from './StripeFeesList.vue';

const { getTranslation: t } = useLang()

defineProps({
    totalAmount: Number,
    deposit: Number,
    nbMensualites: Number,
    // Paid in monthly installments (Stripe subscription)
    isSubscription: Boolean,
    monthlyPayment: Number,
    serviceType: String,
    formatPrice: Function,
    calculateStripeFees: Function,
    websiteUrl: String,
    providerInfo: Object
})
</script>

<style scoped>
/* Amount and payment method chosen */
.payment-details {
    background: #f7f9fb;
    padding: 16px;
    border: 1px solid var(--second-color);
    margin-bottom: 16px
}

.amount-value {
    font-weight: 700
}

/* Chosen option highlighted, the other ones faded */
.payment-option-selected {
    background: #e8f5e9;
    border-left: 4px solid var(--accent-green);
    padding: 12px;
    margin: 12px 0
}

.payment-option-alternative {
    background: #fff3e0;
    border-left: 4px solid var(--accent-yellow);
    padding: 12px;
    margin: 12px 0;
    opacity: 0.8
}

.payment-option-selected strong,
.payment-option-alternative strong {
    color: var(--third-color)
}

/* Bank details for a transfer */
.bank-transfer-option {
    background: #f4edf7;
    border-left: 4px solid var(--accent-purple);
    padding: 10px;
    margin: 10px 0
}

.automatic-debit-section {
    background: #fff3e0;
    border: 2px solid var(--accent-yellow);
    padding: 16px;
    margin: 16px 0
}

.section-subtitle {
    font-weight: 700;
    color: var(--third-color);
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
