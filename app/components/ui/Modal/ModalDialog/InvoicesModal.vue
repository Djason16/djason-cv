<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('downloadInvoices')" @close="close">
        <div class="invoices-modal">
            <!-- Search invoices -->
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchInvoices')"
                    class="text-small" autocomplete="off" />
            </div>

            <!-- Grouped missions table -->
            <EditableTable :items="groupedMissions" :columns="columns" :actions-label="$lang.getTranslation('actions')"
                :delete-label="$lang.getTranslation('delete')" :download-label="$lang.getTranslation('downloadInvoice')"
                :empty-message="$lang.getTranslation('noMissionsFound')" :show-delete="false" :show-download="true"
                @download="downloadInvoice" />

            <!-- Modal footer -->
            <div class="modal-footer">
                <HeroButton type="button" iconClass="fas fa-times" :label="$lang.getTranslation('close')"
                    @click="close" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { computed, nextTick, ref, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import Invoice from '~/components/ui/Invoice/Invoice.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { getServiceTranslationKey, serviceTranslations } from '~/utils/serviceTranslations'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()

const toTranslationKey = name => name ? (serviceTranslations[name] || getServiceTranslationKey(name)) : ''
const translateServiceName = name => {
    const key = toTranslationKey(name)
    const translated = $lang.getTranslation(key)
    return translated !== key ? translated : name
}

const clients = ref([]), missions = ref([]), services = ref([]), loading = ref(false), search = ref('')

const fetchAllData = async () => {
    loading.value = true
    try {
        const [clientsRes, missionsRes, servicesRes] = await Promise.all([
            $fetch('/api/clients/list'),
            $fetch('/api/missions/list'),
            $fetch('/api/services/list')
        ])
        clients.value = clientsRes?.clients?.rows || []
        services.value = servicesRes?.services?.rows || []
        missions.value = missionsRes?.missions?.map(m => {
            const serviceObj = services.value.find(s => s.id === m.service_id)
            const clientObj = clients.value.find(c => c.id === m.client_id) || {}
            return {
                ...m,
                service_name: serviceObj?.name || m.service_id || '-',
                client_type: clientObj.type || 'company',
                client_name: clientObj.company_name || `${clientObj.firstname || ''} ${clientObj.lastname || ''}`.trim() || 'Unknown',
                client_address: clientObj.address || '',
                client_postal_code: clientObj.postal_code || '',
                client_city: clientObj.city || '',
                client_siret: clientObj.siret || '',
                client_phone: clientObj.phone || '',
                client_email: clientObj.email || ''
            }
        }) || []
    } catch (e) { console.error('Error loading data:', e) }
    finally { loading.value = false }
}

watch(() => props.show, val => { if (val) fetchAllData() })

const groupedMissions = computed(() => {
    const groups = {}
    missions.value.forEach(m => {
        const client = m.client_name || 'Unknown', clientType = m.client_type || 'company', missionDate = m.date || ''
        let key = ''
        if (clientType === 'company' || clientType === 'freelance') {
            const month = m.month_concerned || (missionDate ? missionDate.slice(0, 7) : 'unknown')
            key = `${client}_${month}`
            groups[key] ? groups[key].missions.push(m) : groups[key] = { id: key, client, client_address: m.client_address, client_postal_code: m.client_postal_code, client_city: m.client_city, client_siret: m.client_siret, client_phone: m.client_phone, client_email: m.client_email, month, missions: [m], clientType }
        } else {
            key = m.id
            groups[key] = { ...m, client, client_address: m.client_address, client_postal_code: m.client_postal_code, client_city: m.client_city, client_siret: m.client_siret, client_phone: m.client_phone, client_email: m.client_email, month: missionDate.slice(0, 7), missions: [m], clientType }
        }
    })
    return Object.values(groups)
})

const columns = computed(() => [
    { key: 'client', label: $lang.getTranslation('client'), disabled: true },
    {
        key: 'date',
        label: $lang.getTranslation('date'),
        formatter: g => g.clientType === 'company' || g.clientType === 'freelance'
            ? `${(g.missions[0]?.date ? g.missions[0].date.slice(0, 7) : '2025-11')}-XX`
            : g.missions[0]?.date?.slice(0, 10) || '-',
        disabled: false
    },
    {
        key: 'missionsSummary', label: $lang.getTranslation('missionsSummary'), formatter: g => {
            if (g.clientType === 'company' || g.clientType === 'freelance') return g.missions.map(m => m.title?.trim() || $lang.getTranslation(toTranslationKey(m.service_name)) || m.service_name || '-').join(', ')
            const m = g.missions[0]; if (!m) return '-'; return m.title?.trim() || $lang.getTranslation(toTranslationKey(m.service_name)) || m.service_name || '-'
        }, disabled: true
    }
])

const downloadInvoice = async group => {
    if (process.server) return;

    const invoiceNumber = prompt($lang.getTranslation('enterInvoiceNumber'));
    if (!invoiceNumber?.trim()) return alert($lang.getTranslation('invoiceNumberRequired'));

    let sameAsClient = true, deliveryAddress = '';
    if (group.clientType === 'company' || group.clientType === 'freelance') {
        sameAsClient = confirm($lang.getTranslation('sameDeliveryAddressConfirm'));
        if (!sameAsClient) deliveryAddress = prompt($lang.getTranslation('enterDeliveryAddress')) || '';
    }

    const objectDescription = prompt($lang.getTranslation('enterObjectOptional')) || '';
    const orderReference = prompt($lang.getTranslation('enterOrderRefOptional')) || '';

    let depositAmount = 0;
    let remainingToPay = 0;
    let nbMensualites = 0;
    let monthlyPayment = 0;
    let paymentDueDate = '';
    let issueDate = new Date().toISOString();

    if (group.clientType === 'individual') {
        const totalAmount = group.missions.reduce((sum, m) => sum + (m.unit_price * (m.quantity || 1)), 0);
        const serviceName = group.missions[0]?.service_name || '';

        const useMonthly = serviceName.toLowerCase().includes('web') || serviceName.toLowerCase().includes('site')
            ? confirm(`${$lang.getTranslation('webPaymentConfirmTitle')}\n\n${$lang.getTranslation('webPaymentConfirmMonthly')}\n${$lang.getTranslation('webPaymentConfirmCash')}`)
            : false;

        if (useMonthly) {
            const firstPaymentInput = prompt($lang.getTranslation('enterFirstPaymentDate'));
            if (firstPaymentInput) {
                paymentDueDate = firstPaymentInput;

                // Conversion JJ/MM/AAAA en Date
                const [dayStr, monthStr, yearStr] = paymentDueDate.split('/');
                const firstPaymentDate = new Date(`${yearStr}-${monthStr}-${dayStr}`);
                const today = new Date();

                nbMensualites = 12; // Durée fixée à 12 mois
                monthlyPayment = totalAmount / nbMensualites;

                // Calcul nombre mensualités écoulées
                let monthsElapsed = (today.getFullYear() - firstPaymentDate.getFullYear()) * 12 + (today.getMonth() - firstPaymentDate.getMonth());
                if (today.getDate() < firstPaymentDate.getDate()) {
                    monthsElapsed -= 1;
                }
                monthsElapsed = Math.max(0, monthsElapsed);

                // Montant déjà payé = mensualités écoulées * mensualité (pas de dépôt distinct ici)
                const amountPaid = monthlyPayment * monthsElapsed;

                // Calcul restant dû
                remainingToPay = Math.max(0, totalAmount - amountPaid);

                // Mensualités restantes
                nbMensualites = Math.max(1, nbMensualites - monthsElapsed);
                depositAmount = 0; // Pas de dépôt supplémentaire
            } else {
                nbMensualites = 12;
                monthlyPayment = totalAmount / nbMensualites;
                remainingToPay = totalAmount;
                paymentDueDate = '';
                depositAmount = 0;
            }
        } else {
            // Paiement comptant avec possible dépôt 30%
            depositAmount = totalAmount * 0.30;
            remainingToPay = totalAmount - depositAmount;
            paymentDueDate = prompt($lang.getTranslation('enterPaymentDueDate')) || '';
            nbMensualites = 0;
            monthlyPayment = 0;
        }
    } else {
        paymentDueDate = prompt($lang.getTranslation('enterPaymentDueDate')) || '';
    }

    const [html2canvas, { default: jsPDF }, { createApp }] = await Promise.all([
        import('html2canvas').then(m => m.default),
        import('jspdf'),
        import('vue')
    ]);

    const items = (group.clientType === 'company' || group.clientType === 'freelance')
        ? group.missions.map(m => ({
            name: m.title?.trim() || translateServiceName(m.service_name || m.service_id || '-'),
            date: m.date, hours: m.duration, mission: m.title || translateServiceName(m.service_name || m.service_id || '-'),
            quantity: m.quantity || 1, unitPrice: m.unit_price, tvaApplicable: !!m.vat_applicable
        }))
        : [group.missions[0]].map(m => ({
            name: m.description || m.title || translateServiceName(m.service_name || m.service_id || '-'),
            date: m.date, hours: m.duration, mission: '',
            quantity: m.quantity || 1, unitPrice: m.unit_price, tvaApplicable: !!m.vat_applicable
        }));

    const container = document.createElement('div');
    Object.assign(container.style, { position: 'fixed', left: '-9999px', top: '0', width: '210mm', minHeight: '297mm', background: '#fff' });
    document.body.appendChild(container);

    try {
        const fullInvoiceNumber = `${group.clientType === 'individual' ? 'CL' : 'FA'}-${new Date().getFullYear()}-${invoiceNumber.padStart(4, '0')}`;
        const app = createApp(Invoice, {
            type: 'invoice',
            client: {
                name: group.client, address: group.client_address, postal_code: group.client_postal_code,
                city: group.client_city, siret: group.client_siret, phone: group.client_phone,
                email: group.client_email, type: group.clientType
            },
            deliveryAddress,
            sameAsClientAddress: sameAsClient,
            items,
            issueDate,
            invoiceType: 'invoice',
            description: objectDescription,
            orderRef: orderReference,
            deposit: depositAmount,
            monthConcerned: group.month || '',
            customInvoiceNumber: fullInvoiceNumber,
            customPaymentDue: paymentDueDate,
            nbMensualites,
            monthlyPayment,
            remainingToPay
        });
        app.mount(container);
        await nextTick();

        const element = container.querySelector('.invoice-container');
        if (!element) throw new Error('Invoice element not found');

        const canvas = await html2canvas(element, { scale: 2, useCORS: true, scrollY: 0, scrollX: 0, logging: false, windowWidth: element.scrollWidth, windowHeight: element.scrollHeight, backgroundColor: '#fff' });
        const imgData = canvas.toDataURL('image/jpeg', 0.90);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidthMM = canvas.width / 2 * 0.264583;
        const imgHeightMM = canvas.height / 2 * 0.264583;

        if (imgHeightMM <= pdfHeight) {
            pdf.addImage(imgData, 'JPEG', (pdfWidth - imgWidthMM) / 2, 0, imgWidthMM, imgHeightMM);
        } else {
            let y = 0, pageCount = 0;
            while (y < canvas.height) {
                if (pageCount > 0) pdf.addPage();
                const sectionH = Math.min(canvas.height - y, (pdfHeight / 0.264583) * 2);
                const tempCanvas = document.createElement('canvas'); tempCanvas.width = canvas.width; tempCanvas.height = sectionH;
                tempCanvas.getContext('2d').drawImage(canvas, 0, y, canvas.width, sectionH, 0, 0, canvas.width, sectionH);
                pdf.addImage(tempCanvas.toDataURL('image/jpeg', 0.90), 'JPEG', (pdfWidth - imgWidthMM) / 2, 0, imgWidthMM, sectionH / 2 * 0.264583);
                y += sectionH;
                pageCount++;
            }
        }

        pdf.save(`${fullInvoiceNumber}.pdf`);
        app.unmount();
    } catch (err) {
        console.error($lang.getTranslation('errorGeneratingPDF'), err);
        alert($lang.getTranslation('pdfGenerationError'));
    } finally {
        document.body.removeChild(container);
    }
};

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