<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('downloadContracts')" @close="close">
        <div class="contracts-modal">
            <!-- Search bar -->
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchContracts')"
                    class="text-small" />
            </div>

            <!-- Editable contracts table -->
            <EditableTable v-if="columns && groupedContracts" :items="groupedContracts" :columns="columns"
                :actions-label="$lang.getTranslation('actions')" :delete-label="$lang.getTranslation('delete')"
                :download-label="$lang.getTranslation('downloadContract')"
                :empty-message="$lang.getTranslation('noContractsFound')" :show-delete="false" :show-download="true"
                @download="downloadContract" />

            <!-- Modal footer with close button -->
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
import ContractContainer from '~/components/ui/Contract/ContractContainer.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useContractCalculator } from '~/composables/useContractCalculator'
import { useContractData } from '~/composables/useContractData'
import { useDocumentInfo } from '~/composables/useDocumentInfo'
import { usePDFExport } from '~/composables/usePDFExport'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()
const close = () => emit('close')

// Composables for contracts, PDF export, and payment calculations
const { renderAndExport } = usePDFExport()
const { groupedContracts, columns, fetchAllData, search } = useContractData(props)
const { getPaymentConfig, getPaymentOptions, normalizeServiceType } = useContractCalculator()
const { promptDocumentNumber, promptDocumentDate } = useDocumentInfo()

// Fetch contracts when modal opens
watch(() => props.show, v => v && fetchAllData())

// Prompt user for payment choice, returns selected value or null if canceled
const promptPaymentOption = (serviceType, totalAmount) => {
    const options = getPaymentOptions(totalAmount, serviceType)
    if (options.length === 1) return options[0].value

    let message = $lang.getTranslation('contractPaymentChoice')
    options.forEach((opt, i) => {
        message += `${i + 1}. ${opt.label}\n`
        opt.details?.forEach(detail => message += `   ${detail}\n`)
        message += '\n'
    })
    message += $lang.getTranslation('contractPaymentChoicePrompt')

    let choice = null
    while (choice === null) {
        const input = prompt(message)
        if (input === null) return null
        const num = parseInt(input)
        if (num >= 1 && num <= options.length) choice = options[num - 1].value
        else alert($lang.getTranslation('contractPaymentInvalidChoice'))
    }
    return choice
}

// Handle PDF download for a contract
const downloadContract = async group => {
    if (process.server) return

    const contractNumber = await promptDocumentNumber('contract')
    if (!contractNumber) return

    const serviceType = normalizeServiceType(group.serviceType)
    const totalAmount = Number(group.totalAmount) || 0
    const paymentChoice = promptPaymentOption(serviceType, totalAmount)
    if (paymentChoice === null) return

    const contractDate = promptDocumentDate('contract')
    if (contractDate === null) return

    const paymentConfig = getPaymentConfig(totalAmount, serviceType, paymentChoice)

    // Fetch bank info
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

    const fileName = `CO-${new Date().getFullYear()}-${contractNumber.padStart(4, '0')}`

    await renderAndExport({
        component: ContractContainer,
        componentProps: {
            client: {
                name: group.client || '',
                address: group.client_address || '',
                postal_code: group.client_postal_code || '',
                city: group.client_city || '',
                siret: group.client_siret || '',
                phone: group.client_phone || '',
                email: group.client_email || '',
                type: group.clientType || 'individual'
            },
            contractDate,
            contractYear: new Date().getFullYear(),
            contractIndex: contractNumber,
            serviceType,
            totalAmount: paymentConfig.totalAmount,
            deposit: paymentConfig.depositAmount,
            nbMensualites: paymentConfig.nbMensualites,
            monthlyPayment: paymentConfig.monthlyPayment,
            hasTVA: group.hasTVA || false,
            bankInfo
        },
        fileName,
        containerClass: '.contract-container',
        pdfOptions: {
            margin: [10, 10, 10, 10],
            delay: 500,
            html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0, letterRendering: true, logging: false, removeContainer: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'], before: '.page-break' }
        }
    })
}
</script>

<style scoped>
.contracts-modal {
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