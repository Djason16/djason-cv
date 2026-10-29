import { computed, ref, watch } from 'vue'
import ContractContainer from '@/components/views/Documents/ContractContainer.vue'
import DocumentContainer from '@/components/views/Documents/DocumentContainer.vue'
import { useInterestRates } from './useInterestRates.js'
import { useLang } from './useLang.js'
import { useAdminDataStore } from '@/stores/adminData.js'
import { api } from '@/utils/api.js'
import { CLIENT_TYPE_COMPANY, isCompanyType, isProfessionalType } from '@/utils/clientTypes.js'
import { documentProblems } from '@/utils/documentChecks.js'
import { showAlert, showFailure, showSuccess } from '@/utils/dialog.js'
import { askContractDate, askContractPayment, askDetails, askInvoicePayment, askNumber } from '@/utils/documentDialogs.js'
import { contractPayment, documentClient, documentItems, missionTotals, normalizeServiceType, quotePaymentOptions, quoteValidityDate } from '@/utils/documents.js'
import { exportPdf } from '@/utils/pdf.js'
import { translateServiceName } from '@/utils/serviceTranslations.js'

/*
 * Quotes, invoices and contracts of the admin page (components/views/Admin/DocumentsModal.vue):
 *   1. missions, clients and services (stores/adminData.js) are grouped per document
 *   2. the admin answers a few questions in the dialogs of the site (utils/documentDialogs.js)
 *   3. the template of components/views/Documents is filled and saved as a PDF (utils/pdf.js)
 * Rules and amounts: utils/documents.js. Checks before generating: utils/documentChecks.js. Nothing is stored: the PDF is only downloaded.
 *
 *   const { rows, columns, search, download } = useDocuments(props, 'quote' | 'invoice' | 'contract')
 */
export const useDocuments = (props, kind) => {
    const lang = useLang()
    const t = lang.getTranslation
    // Translated name of a service
    const serviceName = name => translateServiceName(name, t)
    const { getApplicableRate } = useInterestRates()
    const config = useRuntimeConfig()

    // Lists shared by every modal (stores/adminData.js)
    const adminData = useAdminDataStore()
    const search = ref('')

    // Data

    // Missions with the details of their client and service
    const missions = computed(() => adminData.missions.map(m => {
        const c = adminData.clients.find(x => x.id === m.client_id) || {}
        return {
            ...m,
            service_name: adminData.services.find(x => x.id === m.service_id)?.name || m.service_id || '-',
            client_type: c.type || CLIENT_TYPE_COMPANY,
            client_name: c.company_name || `${c.firstname || ''} ${c.lastname || ''}`.trim() || 'Unknown',
            client_address: c.address || '',
            client_postal_code: c.postal_code || '',
            client_city: c.city || '',
            client_siret: c.siret || '',
            client_phone: c.phone || '',
            client_email: c.email || '',
        }
    }))

    // Loaded when the modal opens (only what is not loaded yet); contracts also need the interest rates
    const fetchAll = () => adminData.load('clients', 'missions', 'services', ...(kind === 'contract' ? ['interestRates'] : []))
    if (props) watch(() => props.show, show => show && fetchAll())

    // Month of a mission (YYYY-MM), from its date: the date can be edited in the missions table
    const missionMonth = m => m.date?.slice(0, 7) || m.month_concerned || 'unknown'

    // One document per group: companies per client and month (monthly invoice), the other clients per mission day and service
    const groupKey = m => {
        const month = missionMonth(m)
        if (isCompanyType(m.client_type)) return `${m.client_id}_${month}`
        return `${m.client_id}_${m.date}_${m.service_id}`
    }

    const rows = computed(() => {
        const term = search.value.trim().toLowerCase()
        const groups = {}
        for (const m of missions.value) {
            const matches = !term || [m.client_name, m.title, m.service_name].some(v => v?.toLowerCase().includes(term))
            if (!matches) continue
            const key = groupKey(m)
            if (groups[key]) { groups[key].missions.push(m); continue }
            groups[key] = {
                client: m.client_name || 'Unknown',
                clientType: m.client_type || CLIENT_TYPE_COMPANY,
                month: missionMonth(m),
                missions: [m],
                client_address: m.client_address,
                client_postal_code: m.client_postal_code,
                client_city: m.client_city,
                client_siret: m.client_siret,
                client_phone: m.client_phone,
                client_email: m.client_email,
                serviceType: m.service_name?.toLowerCase() || 'web',
            }
        }

        const all = Object.values(groups)
        // Quotes and contracts are for non-company clients only (individual, freelance, association)
        if (kind === 'invoice') return all
        return all.filter(g => g.clientType !== CLIENT_TYPE_COMPANY)
    })

    // Table

    const formatDate = g => {
        const date = g.missions[0]?.date
        if (!date) return '-'
        const d = new Date(date)
        const month = String(d.getMonth() + 1).padStart(2, '0')
        // Companies: monthly document, no day
        if (isCompanyType(g.clientType)) return `XX/${month}/${d.getFullYear()}`
        return `${String(d.getDate()).padStart(2, '0')}/${month}/${d.getFullYear()}`
    }

    // Short text listing the missions of a group (shown in the modal)
    const missionsSummary = g => {
        const title = m => m.title?.trim()
        if (isProfessionalType(g.clientType)) return g.missions.map(m => title(m) || serviceName(m.service_name) || m.service_name || '-').join(' + ')
        if (g.missions.length > 1) return g.missions.map(m => title(m) || '-').join(' + ')
        const m = g.missions[0]
        return title(m) || serviceName(m?.service_name) || m?.service_name || '-'
    }

    const columns = computed(() => [
        { key: 'client', label: t('client'), disabled: true },
        { key: 'date', label: t('date'), disabled: true, formatter: formatDate },
        { key: 'missionsSummary', label: t('missionsSummary'), disabled: true, formatter: missionsSummary },
    ])

    // PDF

    const fetchBank = async () => {
        const res = await api.get('/bank')
        if (!res.success) console.error('Could not fetch bank info:', res.error)
        return { iban: res.bank?.iban ?? null, bic: res.bank?.bic ?? null }
    }

    const year = () => new Date().getFullYear()

    // Bank details when everything needed by the document is filled in, otherwise null after a dialog listing what to fix
    const checkedBank = async group => {
        const bank = await fetchBank()
        const interestRate = kind === 'contract' ? getApplicableRate(group.clientType) : null
        const problems = documentProblems({ kind, group, config, bank, interestRate })
        if (!problems.length) return bank
        await showAlert([t('documentNotReady'), '', ...problems.map(key => `- ${t(key)}`)].join('\n'))
        return null
    }

    // Quote of a group of missions: checks the bank details, asks its number and details, downloads the PDF
    const downloadQuote = async group => {
        const bankInfo = await checkedBank(group)
        if (!bankInfo) return
        const number = await askNumber(t, 'Quote')
        if (!number) return
        const details = await askDetails(t, group.clientType)
        const issueDate = new Date().toISOString()
        const fileName = `DE-${year()}-${number.padStart(4, '0')}`
        const firstService = group.missions[0]?.service_name || ''

        await exportPdf({
            component: DocumentContainer,
            selector: '.document-container',
            fileName,
            props: {
                client: documentClient(group),
                deliveryAddress: details.deliveryAddress,
                sameAsClientAddress: details.sameAsClient,
                items: documentItems(group.missions, serviceName),
                issueDate,
                documentType: 'quote',
                description: serviceName(firstService) || details.objectDescription,
                orderRef: details.orderReference,
                monthConcerned: group.month || '',
                customDocumentNumber: fileName,
                customPaymentDue: quoteValidityDate(issueDate),
                quoteValidityDays: 30,
                paymentOptions: quotePaymentOptions(firstService, missionTotals(group.missions).totalTTC, t),
                bankInfo,
            },
        })
        return true
    }

    // Invoice of a group of missions: checks the bank details, asks its number, details and what is already paid, downloads the PDF
    const downloadInvoice = async group => {
        const bankInfo = await checkedBank(group)
        if (!bankInfo) return
        const number = await askNumber(t, 'Invoice')
        if (!number) return
        const details = await askDetails(t, group.clientType)
        const payment = await askInvoicePayment(t, group, missionTotals(group.missions).totalTTC)
        if (!payment) return
        const fileName = `${isCompanyType(group.clientType) ? 'FA' : 'CL'}-${year()}-${number.padStart(4, '0')}`

        await exportPdf({
            component: DocumentContainer,
            selector: '.document-container',
            fileName,
            props: {
                client: documentClient(group),
                deliveryAddress: details.deliveryAddress,
                sameAsClientAddress: details.sameAsClient,
                items: documentItems(group.missions, serviceName),
                issueDate: new Date().toISOString(),
                documentType: 'invoice',
                description: group.clientType === 'individual' ? serviceName(group.missions[0]?.service_name || '') : details.objectDescription,
                orderRef: details.orderReference,
                deposit: payment.depositAmount,
                monthConcerned: group.month || '',
                customDocumentNumber: fileName,
                customPaymentDue: payment.paymentDueDate,
                nbMensualites: payment.nbMensualites,
                monthlyPayment: payment.monthlyPayment,
                remainingToPay: payment.remainingToPay,
                amountPaid: payment.amountPaid,
                bankInfo,
            },
        })
        return true
    }

    // Contract of a group of missions: checks the bank details, asks its number, the payment choice and the date, downloads the PDF
    const downloadContract = async group => {
        const bankInfo = await checkedBank(group)
        if (!bankInfo) return
        const number = await askNumber(t, 'Contract')
        if (!number) return
        const serviceType = normalizeServiceType(group.serviceType)
        // Contract total: every mission of the group (same day and service), VAT included where it applies
        const total = missionTotals(group.missions).totalTTC
        const choice = await askContractPayment(t, lang.current.value, serviceType, total)
        if (choice === null) return
        const contractDate = await askContractDate(t)
        if (contractDate === null) return
        const payment = contractPayment(total, serviceType, choice)

        await exportPdf({
            component: ContractContainer,
            selector: '.contract-container',
            fileName: `CO-${year()}-${number.padStart(4, '0')}`,
            html2canvas: { removeContainer: true },
            props: {
                client: documentClient(group),
                contractDate,
                contractYear: year(),
                contractIndex: number,
                serviceType,
                totalAmount: payment.totalAmount,
                deposit: payment.depositAmount,
                nbMensualites: payment.nbMensualites,
                monthlyPayment: payment.monthlyPayment,
                hasTVA: group.missions.some(m => m.vat_applicable === 1),
                interestRate: getApplicableRate(group.clientType),
                bankInfo,
            },
        })
        return true
    }

    // Success or error dialog once the document is made (nothing shown when the admin cancelled a question)
    const withResult = make => async group => {
        try {
            if (await make(group)) await showSuccess(t('documentDownloaded'))
        } catch {
            await showFailure(t('documentFailed'))
        }
    }

    const download = withResult({ quote: downloadQuote, invoice: downloadInvoice, contract: downloadContract }[kind])

    return { rows, columns, search, download }
}
