<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('downloadInvoices')" @close="close">
        <div class="invoices-modal">
            <!-- Search bar for filtering invoices -->
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchInvoices')"
                    class="text-small" autocomplete="off" />
            </div>

            <!-- Editable table listing invoices -->
            <EditableTable :items="groupedData" :columns="columns" :actions-label="$lang.getTranslation('actions')"
                :delete-label="$lang.getTranslation('delete')" :download-label="$lang.getTranslation('downloadInvoice')"
                :empty-message="$lang.getTranslation('noMissionsFound')" :show-delete="false" :show-download="true"
                @download="downloadInvoice" />

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
import { watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import DocumentContainer from '~/components/ui/Document/DocumentContainer.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useDocumentInfo } from '~/composables/useDocumentInfo'
import { useDocumentsData } from '~/composables/useDocumentsData'
import { useFinancialCalculations } from '~/composables/useFinancialCalculations'
import { usePaymentCalculator } from '~/composables/usePaymentCalculator'
import { usePDFExport } from '~/composables/usePDFExport'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()
const close = () => emit('close')

// Composables for PDF export, data, calculations, and payment
const { renderAndExport } = usePDFExport()
const { groupedData, columns, fetchAllData, search, translateServiceName } = useDocumentsData(props)
const { calculateTotals } = useFinancialCalculations()
const { promptDocumentNumber, promptDeliveryAddress, promptOptionalInfo } = useDocumentInfo()
const { promptIndividualPayment, getCompanyPaymentData } = usePaymentCalculator()

// Fetch data when modal opens
watch(() => props.show, v => v && fetchAllData())

// Handle invoice PDF download
const downloadInvoice = async group => {
    if (process.server) return

    // Prompt for invoice number, delivery, optional info
    const invoiceNumber = await promptDocumentNumber('invoice')
    if (!invoiceNumber) return
    const deliveryInfo = await promptDeliveryAddress(group.clientType)
    if (!deliveryInfo) return
    const optionalInfo = await promptOptionalInfo(group.clientType)
    if (!optionalInfo) return

    // Compute totals and payment details
    const { totalHT, totalTVA, totalTTC } = calculateTotals(group.missions)
    const isIndividual = group.clientType === 'individual'
    const paymentData = isIndividual
        ? await promptIndividualPayment(group.missions[0]?.service_name || '', totalTTC)
        : getCompanyPaymentData()
    if (!paymentData) return

    let bankInfo = { iban: null, bic: null }
    try {
        const bankData = await $fetch('/api/bank')
        if (bankData) {
            bankInfo = {
                iban: bankData.iban,
                bic: bankData.bic
            }
        }
    } catch (err) {
        console.error('Could not fetch bank info:', err)
    }

    // Prepare filename
    const fileName = `${isIndividual ? 'CL' : 'FA'}-${new Date().getFullYear()}-${invoiceNumber.padStart(4, '0')}`

    // Export PDF with all necessary props
    await renderAndExport({
        component: DocumentContainer,
        componentProps: {
            type: 'invoice',
            client: {
                name: group.client, address: group.client_address, postal_code: group.client_postal_code,
                city: group.client_city, siret: group.client_siret, phone: group.client_phone,
                email: group.client_email, type: group.clientType
            },
            deliveryAddress: deliveryInfo.deliveryAddress,
            sameAsClientAddress: deliveryInfo.sameAsClient,
            items: group.missions.map(m => ({
                name: m.title?.trim() || (isIndividual ? translateServiceName(m.service_name) : m.service_name) || '-',
                date: m.date, hours: m.duration,
                mission: !isIndividual ? m.title || m.service_name || '-' : '',
                quantity: m.quantity || 1, unitPrice: m.unit_price, tvaApplicable: !!m.vat_applicable
            })),
            issueDate: new Date().toISOString(),
            documentType: 'invoice',
            description: isIndividual ? translateServiceName(group.missions[0]?.service_name || '') : optionalInfo.objectDescription,
            orderRef: optionalInfo.orderReference,
            deposit: paymentData.depositAmount,
            monthConcerned: group.month || '',
            customDocumentNumber: fileName,
            customPaymentDue: paymentData.paymentDueDate,
            nbMensualites: paymentData.nbMensualites,
            monthlyPayment: paymentData.monthlyPayment,
            remainingToPay: paymentData.remainingToPay,
            amountPaid: paymentData.amountPaid,
            totalHT, totalTVA, totalTTC,
            bankInfo
        },
        fileName,
        containerClass: '.document-container',
        pdfOptions: {
            margin: [10, 10, 10, 10],
            delay: 1500,
            html2canvas: {
                scale: 2,
                useCORS: true,
                scrollY: 0,
                scrollX: 0,
                letterRendering: true,
                logging: false
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4',
                orientation: 'portrait',
                compress: true
            },
            pagebreak: {
                mode: ['avoid-all', 'css', 'legacy'],
                before: '.page-break'
            }
        }
    })
}
</script>

<style scoped>
.invoices-modal {
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