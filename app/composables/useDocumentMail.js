import { useBillingStore } from '@/stores/billing.js'
import { api } from '@/utils/api.js'
import { pdfOptions } from '@/utils/documentPdf.js'
import { exportPdf } from '@/utils/pdf.js'

/*
 * Quotes, contracts and invoices sent by email to their client, their PDF attached: the PDF is drawn here, in the browser
 * (the same file as the download), the server sends it (POST /api/documents/{id}/send).
 *   const { send } = useDocumentMail()
 *   await send([quote, contract], 'documents')    one email, both attached
 *   await send([invoice], 'paid')                 a payment received: thanks, its invoice attached
 * An invoice paid online is sent by the server alone (server/helpers/DocumentMailHelper.js, its PDF drawn by the server).
 */

// Bank details printed on the documents, read once
let bank = null
const loadBank = async () => {
    if (bank) return bank
    const res = await api.get('/bank')
    bank = res.success ? { iban: res.bank?.iban, bic: res.bank?.bic } : {}
    return bank
}

export const useDocumentMail = () => {
    const billing = useBillingStore()

    const send = async (docs, kind = 'documents') => {
        try {
            const details = await loadBank()
            const files = []
            for (const doc of docs) {
                const options = pdfOptions(doc, {}, details)
                files.push({ name: options.fileName, pdf: await exportPdf({ ...options, output: 'base64' }) })
            }
            return await billing.sendMail(docs[0].id, { kind, files, with: docs.slice(1).map(doc => doc.id) })
        } catch {
            return { success: false, error: 'documentFailed' }
        }
    }

    return { send }
}
