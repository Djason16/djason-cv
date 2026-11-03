import BillingDocument from '@/components/views/Documents/BillingDocument.vue'
import ContractContainer from '@/components/views/Documents/ContractContainer.vue'
import { contractProps } from '@/utils/contractDocument.js'

/*
 * What utils/pdf.js needs to draw a document: its template (a contract, or a quote / an invoice), its props and its file name.
 *   await exportPdf(pdfOptions(doc, clientInfo, bank))
 * clientInfo: the client of a draft (a finalized document prints its own copy); bank: { iban, bic }
 */
export const pdfOptions = (doc, clientInfo = {}, bank = {}, draftName = 'Brouillon') => {
    const copy = JSON.parse(JSON.stringify(doc))
    const isContract = copy.type === 'contract'
    return {
        component: isContract ? ContractContainer : BillingDocument,
        fileName: copy.number || `${draftName}-${copy.title || ''}`.replace(/-$/, ''),
        props: isContract ? contractProps(copy, clientInfo, bank) : { doc: copy, clientInfo, bank },
    }
}
