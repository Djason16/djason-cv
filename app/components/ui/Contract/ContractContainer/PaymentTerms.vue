<template>
    <!-- Payment Terms section: amounts, selected and alternative options, payment methods -->
    <section class="section">
        <h3 class="section-title text-large text-bold">4. {{ $lang.getTranslation('paymentTerms') }}</h3>
        <p class="section-text text-small">{{ $lang.getTranslation('paymentsAccordingToQuote') }}</p>

        <!-- Show payment details only if totalAmount > 0 -->
        <div v-if="totalAmount > 0" class="payment-details text-small">
            <p class="info-label">{{ $lang.getTranslation('financialDetails') }}:</p>
            <div class="info-content">
                {{ $lang.getTranslation('totalAmount') }}: <span class="amount-value">{{ formatPrice(totalAmount)
                }}</span><br />

                <!-- Selected payment option -->
                <div class="payment-option-selected">
                    <strong>{{ $lang.getTranslation('selectedOption') }}:</strong><br />
                    <span v-if="nbMensualites && monthlyPayment">
                        {{ $lang.getTranslation('monthlyPaymentOption') }}<br />
                        {{ $lang.getTranslation('numberOfInstallments') }}: <span class="amount-value">{{ nbMensualites
                        }}</span><br />
                        {{ $lang.getTranslation('monthlyPayment') }}: <span class="amount-value">{{
                            formatPrice(monthlyPayment) }}</span>
                    </span>
                    <span v-else-if="deposit">
                        {{ $lang.getTranslation('upfrontPaymentOption') }}<br />
                        {{ $lang.getTranslation('deposit') }}: <span class="amount-value">{{ formatPrice(deposit)
                        }}</span>
                        ({{ Math.round((deposit / totalAmount) * 100) }}%)<br />
                        {{ $lang.getTranslation('remainingBalance') }}: <span class="amount-value">{{
                            formatPrice(totalAmount - deposit) }}</span>
                    </span>
                    <span v-else-if="serviceType === 'repair'">
                        {{ $lang.getTranslation('fullPaymentAfterIntervention') }}
                    </span>
                </div>

                <!-- Alternative options for web services -->
                <div class="payment-option-alternative" v-if="serviceType === 'web'">
                    <strong>{{ $lang.getTranslation('alternativeOption') }}:</strong><br />
                    <span v-if="nbMensualites && monthlyPayment">
                        {{ $lang.getTranslation('upfrontPaymentOption') }}<br />
                        {{ $lang.getTranslation('deposit') }}: <span class="amount-value">{{ formatPrice(totalAmount *
                            0.30) }}</span> (30%)<br />
                        {{ $lang.getTranslation('remainingBalance') }}: <span class="amount-value">{{
                            formatPrice(totalAmount * 0.70) }}</span>
                    </span>
                    <span v-else-if="deposit">
                        {{ $lang.getTranslation('monthlyPaymentOption') }}<br />
                        {{ $lang.getTranslation('numberOfInstallments') }}: <span class="amount-value">12</span><br />
                        {{ $lang.getTranslation('monthlyPayment') }}: <span class="amount-value">{{
                            formatPrice(totalAmount / 12) }}</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Available payment methods -->
        <p class="section-text text-small">{{ $lang.getTranslation('paymentCanBeMade') }}:</p>
        <ul class="bullet-list text-small">
            <li>{{ $lang.getTranslation('paymentByCard') }} <a :href="`${websiteUrl}/pay-me`">{{ websiteUrl
            }}/pay-me</a></li>
            <li>
                {{ $lang.getTranslation('paymentByBankTransfer', {
                    iban: providerInfo.bank.iban,
                    bic: providerInfo.bank.bic
                }) }}
            </li>
            <li>{{ $lang.getTranslation('paymentOtherMeans') }}</li>
        </ul>
    </section>
</template>

<script setup>
import { useNuxtApp } from '#app';
const { $lang } = useNuxtApp()

const props = defineProps({
    totalAmount: Number,
    deposit: Number,
    nbMensualites: Number,
    monthlyPayment: Number,
    serviceType: String,
    formatPrice: Function,
    websiteUrl: String,
    providerInfo: Object
})
</script>

<style scoped>
.section {
    margin-bottom: 25px
}

.section-title {
    color: var(--third-color);
    margin-bottom: 12px;
    border-bottom: 2px solid var(--second-color);
    padding-bottom: 6px
}

.section-text {
    text-align: justify;
    margin-bottom: 16px;
    line-height: 1.8
}

.payment-details {
    background: #f7f9fb;
    padding: 16px;
    border: 1px solid var(--second-color);
    margin-bottom: 16px
}

.info-label {
    font-weight: 700;
    margin-bottom: 6px
}

.info-content {
    margin-left: 20px;
    line-height: 1.8
}

.amount-value {
    font-weight: 700
}

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

.bullet-list {
    list-style: none;
    padding-left: 20px;
    margin: 0 0 16px 0;
    line-height: 1.8
}

.bullet-list li {
    margin-bottom: 8px;
    text-align: justify;
    position: relative;
    padding-left: 20px;
}

.bullet-list li::before {
    content: "• ";
    position: absolute;
    left: 0;
    font-weight: bold;
}

a {
    color: var(--accent-blue);
    text-decoration: none
}

a:hover {
    text-decoration: underline
}
</style>