<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('downloadQuotes')" @close="close">
        <div class="quotes-modal">
            <!-- Search input for filtering quotes -->
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchQuotes')"
                    class="text-small" autocomplete="off" />
            </div>

            <!-- Table of non-company client quotes (individual, freelance, association) -->
            <EditableTable :items="quotableMissions" :columns="columns" :actions-label="$lang.getTranslation('actions')"
                :delete-label="$lang.getTranslation('delete')" :download-label="$lang.getTranslation('downloadQuote')"
                :empty-message="$lang.getTranslation('noMissionsFound')" :show-delete="false" :show-download="true"
                @download="downloadQuote" />

            <!-- Footer with close button -->
            <div class="modal-footer">
                <HeroButton type="button" iconClass="fas fa-times" :label="$lang.getTranslation('close')"
                    @click="close" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import DocumentContainer from '~/components/ui/Document/DocumentContainer.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useDocumentInfo } from '~/composables/useDocumentInfo'
import { useDocumentsData } from '~/composables/useDocumentsData'
import { useFinancialCalculations } from '~/composables/useFinancialCalculations'
import { usePDFExport } from '~/composables/usePDFExport'
import { useQuoteCalculator } from '~/composables/useQuoteCalculator'
import { CLIENT_TYPE_COMPANY } from '~/utils/clientTypes'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()
const close = () => emit('close')

// Composables
const { renderAndExport } = usePDFExport()
const { groupedData, columns, fetchAllData, search, translateServiceName } = useDocumentsData(props)
const { calculateTotals } = useFinancialCalculations()
const { promptDocumentNumber, promptDeliveryAddress, promptOptionalInfo } = useDocumentInfo()
const { getQuoteValidityDate, getIndividualPaymentOptions } = useQuoteCalculator()

// Filter for all non-company clients (individual, freelance, association)
const quotableMissions = computed(() => groupedData.value.filter(g => g.clientType !== CLIENT_TYPE_COMPANY))

// Fetch data when modal opens
watch(() => props.show, v => v && fetchAllData())

// Handle PDF download for non-company client quote
const downloadQuote = async group => {
    if (process.server || group.clientType === CLIENT_TYPE_COMPANY) return

    // Prompt for document number, delivery info, and optional info
    const quoteNumber = await promptDocumentNumber('quote')
    if (!quoteNumber) return
    const deliveryInfo = await promptDeliveryAddress(group.clientType)
    if (!deliveryInfo) return
    const optionalInfo = await promptOptionalInfo(group.clientType)
    if (!optionalInfo) return

    // Calculate totals and get validity/payment info
    const { totalHT, totalTVA, totalTTC } = calculateTotals(group.missions)
    const issueDate = new Date().toISOString()
    const validityDate = getQuoteValidityDate(issueDate)
    const paymentOptions = getIndividualPaymentOptions(group.missions[0]?.service_name || '', totalTTC)

    let bankInfo = { iban: null, bic: null }
    try {
        const bankData = await $fetch('/api/bank')
        if (bankData) bankInfo = { iban: bankData.iban, bic: bankData.bic }
    } catch (err) {
        console.error('Could not fetch bank info:', err)
    }

    const fileName = `DE-${new Date().getFullYear()}-${quoteNumber.padStart(4, '0')}`

    await renderAndExport({
        component: DocumentContainer,
        componentProps: {
            type: 'quote',
            client: {
                name: group.client, address: group.client_address, postal_code: group.client_postal_code,
                city: group.client_city, siret: group.client_siret, phone: group.client_phone,
                email: group.client_email, type: group.clientType
            },
            deliveryAddress: deliveryInfo.deliveryAddress,
            sameAsClientAddress: deliveryInfo.sameAsClient,
            items: group.missions.map(m => ({
                name: m.title?.trim() || translateServiceName(m.service_name) || '-',
                date: m.date,
                hours: m.tjm > 0 ? m.duration : null,
                mission: m.tjm > 0 ? (m.title?.trim() || '') : '',
                quantity: m.quantity || 1,
                unitPrice: m.unit_price,
                tvaApplicable: !!m.vat_applicable
            })),
            issueDate, documentType: 'quote',
            description: translateServiceName(group.missions[0]?.service_name || '') || optionalInfo.objectDescription,
            orderRef: optionalInfo.orderReference, monthConcerned: group.month || '',
            customDocumentNumber: fileName, customPaymentDue: validityDate,
            quoteValidityDays: 30, paymentOptions, totalHT, totalTVA, totalTTC,
            bankInfo
        },
        fileName,
        containerClass: '.document-container',
    })
}
</script>

<style scoped>
.quotes-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 1920px;
    min-width: 60vw;
    max-height: 80vh;
    overflow: hidden;
    color: var(--text-color-dark)
}

.search-bar {
    display: flex;
    justify-content: flex-end
}

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto
}
</style>