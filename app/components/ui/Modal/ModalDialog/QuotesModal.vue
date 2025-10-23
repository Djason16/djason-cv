<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('downloadQuotes')" @close="close">
        <div class="quotes-modal">
            <!-- Filter input -->
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchQuotes')"
                    class="text-small" autocomplete="off" />
            </div>

            <!-- Table of individual missions with download -->
            <EditableTable :items="individualMissions" :columns="columns"
                :actions-label="$lang.getTranslation('actions')" :delete-label="$lang.getTranslation('delete')"
                :download-label="$lang.getTranslation('downloadQuote')"
                :empty-message="$lang.getTranslation('noMissionsFound')" :show-delete="false" :show-download="true"
                @download="downloadQuote" />

            <!-- Footer actions -->
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
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useDocumentPDF } from '~/composables/useDocumentPDF'
import { useDocumentsData } from '~/composables/useDocumentsData'
import { useQuoteCalculator } from '~/composables/useQuoteCalculator'
import { getServiceTranslationKey, serviceTranslations } from '~/utils/serviceTranslations'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()
const { renderAndExport } = useDocumentPDF()
const { groupedMissions, columns, fetchAllData, search } = useDocumentsData(props)
const individualMissions = computed(() => groupedMissions.value.filter(g => g.clientType === 'individual'))
const isIndividualType = t => t === 'individual'

// Get translated service name or fallback
const translateServiceName = n => {
    const key = n ? serviceTranslations[n] || getServiceTranslationKey(n) : ''
    const t = $lang.getTranslation(key)
    return t !== key ? t : n
}

// Refresh data when modal opens
watch(() => props.show, v => v && fetchAllData())

// Generate quote PDF (individual clients only)
const downloadQuote = async group => {
    if (process.server || !isIndividualType(group.clientType)) return
    const { calculateTotals, promptQuoteInfo, getQuoteValidityDate, getIndividualPaymentOptions } = useQuoteCalculator()
    const quoteInfo = await promptQuoteInfo(group)
    if (!quoteInfo) return

    const { quoteNumber, objectDescription, orderReference, deliveryAddress, sameAsClient } = quoteInfo
    const { totalHT, totalTVA, totalTTC } = calculateTotals(group.missions)
    const issueDate = new Date().toISOString()
    const validityDate = getQuoteValidityDate(issueDate)
    const paymentOptions = getIndividualPaymentOptions(group.missions[0]?.service_name || '', totalTTC)
    const fileName = `DE-${new Date().getFullYear()}-${quoteNumber.padStart(4, '0')}`

    await renderAndExport({
        fileName,
        componentProps: {
            type: 'quote',
            client: {
                name: group.client,
                address: group.client_address,
                postal_code: group.client_postal_code,
                city: group.client_city,
                siret: group.client_siret,
                phone: group.client_phone,
                email: group.client_email,
                type: group.clientType
            },
            deliveryAddress,
            sameAsClientAddress: sameAsClient,
            items: group.missions.map(m => ({
                name: m.title?.trim() || translateServiceName(m.service_name) || '-',
                date: m.date,
                hours: m.duration,
                mission: '',
                quantity: m.quantity || 1,
                unitPrice: m.unit_price,
                tvaApplicable: !!m.vat_applicable
            })),
            issueDate,
            documentType: 'quote',
            description: translateServiceName(group.missions[0]?.service_name || '') || objectDescription,
            orderRef: orderReference,
            monthConcerned: group.month || '',
            customDocumentNumber: fileName,
            customPaymentDue: validityDate,
            quoteValidityDays: 30,
            paymentOptions,
            totalHT,
            totalTVA,
            totalTTC
        }
    })
}

const close = () => emit('close')
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
    color: var(--text-color-dark);
}

.search-bar {
    display: flex;
    justify-content: flex-end;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto;
}
</style>