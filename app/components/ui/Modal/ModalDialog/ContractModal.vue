<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('downloadContracts')" @close="close">
        <div class="contracts-modal">
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchContracts')"
                    class="text-small" />
            </div>

            <EditableTable v-if="columns && groupedContracts" :items="groupedContracts" :columns="columns"
                :actions-label="$lang.getTranslation('actions')" :delete-label="$lang.getTranslation('delete')"
                :download-label="$lang.getTranslation('downloadContract')"
                :empty-message="$lang.getTranslation('noContractsFound')" :show-delete="false" :show-download="true"
                @download="downloadContract" />

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
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useContractCalculator } from '~/composables/useContractCalculator'
import { useContractData } from '~/composables/useContractData'
import { useContractPDF } from '~/composables/useContractPDF'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()

const { groupedContracts, columns, fetchAllData, search } = useContractData(props)
const { renderAndExport } = useContractPDF()
const { getPaymentConfig, promptContractInfo } = useContractCalculator()

const close = () => emit('close')
watch(() => props.show, v => v && fetchAllData())

// Map raw service type to normalized category (web/video/repair)
const normalizeServiceType = (rawType) => {
    if (!rawType) return 'web'
    const normalized = rawType.toLowerCase().trim()
    if (['web', 'video', 'repair'].includes(normalized)) return normalized
    if (normalized.includes('web') || normalized.includes('site') || normalized.includes('development')) return 'web'
    if (normalized.includes('video') || normalized.includes('montage') || normalized.includes('vfx')) return 'video'
    if (normalized.includes('repair') || normalized.includes('réparation') || normalized.includes('ordinateur')) return 'repair'
    return 'web'
}

// Generate and download contract PDF with auto-calculated payment structure
const downloadContract = async (group) => {
    if (process.server) return

    const contractInfo = await promptContractInfo(group)
    if (!contractInfo) return

    const total = Number(group.totalAmount) || 0
    const type = normalizeServiceType(group.serviceType)
    const paymentConfig = getPaymentConfig(total, type)
    const fileName = `CO-${new Date().getFullYear()}-${contractInfo.contractNumber || group.contractNumber || '0000'}`

    await renderAndExport({
        fileName,
        componentProps: {
            client: {
                name: group.client ?? '',
                address: group.client_address ?? '',
                postal_code: group.client_postal_code ?? '',
                city: group.client_city ?? '',
                siret: group.client_siret ?? '',
                phone: group.client_phone ?? '',
                email: group.client_email ?? '',
                type: group.clientType ?? 'individual'
            },
            contractDate: contractInfo.contractDate || group.contractDate || new Date().toISOString(),
            contractYear: new Date().getFullYear(),
            contractIndex: contractInfo.contractNumber || group.contractNumber || '0000',
            serviceType: type,
            totalAmount: paymentConfig.totalAmount,
            deposit: paymentConfig.depositAmount,
            nbMensualites: paymentConfig.nbMensualites,
            monthlyPayment: paymentConfig.monthlyPayment,
            hasTVA: group.hasTVA ?? false
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