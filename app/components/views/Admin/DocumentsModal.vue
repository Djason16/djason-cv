<template>
    <!-- Quotes, invoices or contracts to download as PDF (logic: composables/useDocuments.js) -->
    <TableModal :show="show" :title="t(labels.title)"
        v-model:search="search" :search-placeholder="t(labels.search)" @close="close">
        <EditableTable :items="rows" :columns="columns" :actions-label="t('actions')"
            :delete-label="t('delete')" :download-label="t(labels.download)"
            :empty-message="t(labels.empty)" :show-delete="false" :show-download="true"
            @download="download" />
    </TableModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useDocuments } from '@/composables/useDocuments.js'

const { getTranslation: t } = useLang()

const props = defineProps({
    show: Boolean,
    kind: { type: String, required: true, validator: v => ['quote', 'invoice', 'contract'].includes(v) },
})
const emit = defineEmits(['close'])
const close = () => emit('close')

// Texts of each kind of document (plugins/translations/pages/admin/documents.js)
const LABELS = {
    quote: { title: 'downloadQuotes', search: 'searchQuotes', download: 'downloadQuote', empty: 'noMissionsFound' },
    invoice: { title: 'downloadInvoices', search: 'searchInvoices', download: 'downloadInvoice', empty: 'noMissionsFound' },
    contract: { title: 'downloadContracts', search: 'searchContracts', download: 'downloadContract', empty: 'noContractsFound' },
}
const labels = LABELS[props.kind]

const { rows, columns, search, download } = useDocuments(props, props.kind)
</script>
