<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('downloadInvoices')" @close="close">
        <div class="invoices-modal">
            <!-- Search input -->
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchInvoices')"
                    class="text-small" autocomplete="off" />
            </div>

            <!-- Table of grouped missions -->
            <EditableTable :items="groupedMissions" :columns="columns" :actions-label="$lang.getTranslation('actions')"
                :delete-label="$lang.getTranslation('delete')" :download-label="$lang.getTranslation('downloadInvoice')"
                :empty-message="$lang.getTranslation('noMissionsFound')" :show-delete="false" :show-download="true"
                @download="downloadInvoice" />

            <!-- Modal actions -->
            <div class="modal-footer">
                <HeroButton type="button" iconClass="fas fa-times" :label="$lang.getTranslation('close')"
                    @click="close" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { nextTick, watch } from 'vue'
import { useNuxtApp } from '#app'
import ModalDialog from '../ModalDialog.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import Document from '~/components/ui/Document/Document.vue'
import { useDocumentsData } from '~/composables/useDocumentsData'
import { usePaymentCalculator } from '~/composables/usePaymentCalculator'
import { getServiceTranslationKey, serviceTranslations } from '~/utils/serviceTranslations'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()

// Data and table config
const { groupedMissions, columns, fetchAllData, search } = useDocumentsData(props)

// Translate service names with fallback
const translateServiceName = n => {
    const key = n ? (serviceTranslations[n] || getServiceTranslationKey(n)) : ''
    const t = $lang.getTranslation(key)
    return t !== key ? t : n
}

// Refresh data when modal opens
watch(() => props.show, v => v && fetchAllData())

// Generate PDF invoice
const downloadInvoice = async group => {
    if (process.server) return
    const { calculateTotals, promptIndividualPayment, promptDocumentInfo, getCompanyPaymentData } = usePaymentCalculator()
    const docInfo = await promptDocumentInfo(group)
    if (!docInfo) return

    const { invoiceNumber, objectDescription, orderReference, deliveryAddress, sameAsClient } = docInfo
    const { totalHT, totalTVA, totalTTC } = calculateTotals(group.missions)
    const issueDate = new Date().toISOString()
    const paymentData = group.clientType === 'individual'
        ? await promptIndividualPayment(group.missions[0]?.service_name || '', totalTTC)
        : getCompanyPaymentData()
    const { depositAmount, amountPaid, remainingToPay, nbMensualites, monthlyPayment, paymentDueDate } = paymentData

    const [html2canvas, { default: jsPDF }, { createApp }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf'),
        import('vue')
    ])

    // Prepare invoice items
    const items = (group.clientType === 'company' || group.clientType === 'freelance')
        ? group.missions.map(m => ({
            name: m.title?.trim() || translateServiceName(m.service_name || m.service_id || '-'),
            date: m.date,
            hours: m.duration,
            mission: m.title || translateServiceName(m.service_name || m.service_id || '-'),
            quantity: m.quantity || 1,
            unitPrice: m.unit_price,
            tvaApplicable: !!m.vat_applicable
        }))
        : [group.missions[0]].map(m => ({
            name: m.description || m.title || translateServiceName(m.service_name || m.service_id || '-'),
            date: m.date,
            hours: m.duration,
            mission: '',
            quantity: m.quantity || 1,
            unitPrice: m.unit_price,
            tvaApplicable: !!m.vat_applicable
        }))

    // Create hidden container for Vue mounting
    const container = Object.assign(document.createElement('div'), {
        style: 'position:fixed;left:-9999px;top:0;width:210mm;background:#fff;overflow:visible;'
    })
    document.body.appendChild(container)

    try {
        const fullNum = `${group.clientType === 'individual' ? 'CL' : 'FA'}-${new Date().getFullYear()}-${invoiceNumber.padStart(4, '0')}`
        const app = createApp(Document, {
            type: 'invoice',
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
            items,
            issueDate,
            documentType: 'invoice',
            description: objectDescription,
            orderRef: orderReference,
            deposit: depositAmount,
            monthConcerned: group.month || '',
            customDocumentNumber: fullNum,
            customPaymentDue: paymentDueDate,
            nbMensualites,
            monthlyPayment,
            remainingToPay,
            amountPaid,
            totalHT,
            totalTVA,
            totalTTC
        })

        app.mount(container)
        await nextTick()
        const el = container.querySelector('.document-container')
        if (!el) throw new Error('Invoice element not found')

        const canvas = await html2canvas(el, { scale: 2, useCORS: true, scrollY: 0, backgroundColor: '#fff' })
        const imgData = canvas.toDataURL('image/jpeg', 0.9)
        const pdf = new jsPDF('p', 'mm', 'a4')
        const pw = pdf.internal.pageSize.getWidth()
        const ph = pdf.internal.pageSize.getHeight()
        const iw = (canvas.width / 2) * 0.264583
        const ih = (canvas.height / 2) * 0.264583

        // Single-page or split across pages
        if (ih <= ph) pdf.addImage(imgData, 'JPEG', (pw - iw) / 2, 0, iw, ih)
        else {
            let y = 0
            while (y < canvas.height) {
                const sh = Math.min(canvas.height - y, (ph / 0.264583) * 2)
                const temp = Object.assign(document.createElement('canvas'), { width: canvas.width, height: sh })
                temp.getContext('2d').drawImage(canvas, 0, y, canvas.width, sh, 0, 0, canvas.width, sh)
                const imgTemp = temp.toDataURL('image/jpeg', 0.9)
                if (y > 0) pdf.addPage()
                pdf.addImage(imgTemp, 'JPEG', (pw - iw) / 2, 0, iw, (sh / 2) * 0.264583)
                y += sh
            }
        }

        pdf.save(`${fullNum}.pdf`)
        app.unmount()
    } catch (err) {
        console.error($lang.getTranslation('errorGeneratingPDF'), err)
        alert($lang.getTranslation('pdfGenerationError'))
    } finally {
        document.body.removeChild(container)
    }
}

const close = () => emit('close')
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