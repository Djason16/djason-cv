<template>
    <!--
        Table of the admin modals, in the style of the site (assets/css/components/editable-table.css):
        a numbered row per item, thin rules, the column names in small spaced capitals, the row under the mouse marked in mint.
        A click on a cell with a pencil edits it (TableCell). Columns with detail: true are not on the row: the arrow of the row
        opens them under it (short rows, no scrolling sideways). per-page: pages instead of a scrollbar (TablePager).
        Optional delete / download buttons; an item with _section: 'Title' is a title row that splits the table into groups.
    -->
    <div class="editable-table-block">
        <div ref="tableWrapper" :class="{ 'has-scroll': hasScroll, 'is-paged': perPage > 0 }" class="editable-table-wrapper">
            <table class="editable-table">
                <thead>
                    <tr class="text-label">
                        <th class="col-index" aria-label="#">#</th>
                        <th v-for="col in mainColumns" :key="col.key" :title="col.label">{{ col.label }}</th>
                        <th v-if="showActions || detailColumns.length" class="col-actions">{{ actionsLabel }}</th>
                    </tr>
                </thead>
                <!-- A new page: its rows slide in one after the other, from the side of the page (editable-table-detail.css) -->
                <tbody :key="perPage > 0 ? page : 0" :class="turn && `turn-${turn}`">
                    <template v-for="(item, index) in pageItems" :key="item[itemKey]">
                        <!-- Title row of a group -->
                        <tr v-if="item._section" class="table-section">
                            <td :colspan="span" class="eyebrow">{{ item._section }}</td>
                        </tr>
                        <template v-else>
                            <tr class="table-row text-body-s" :class="{ 'is-open': isOpen(item) }" :style="{ '--i': index }">
                                <td class="col-index eyebrow" aria-hidden="true">{{ rowNumber(index) }}</td>
                                <td v-for="col in mainColumns" :key="col.key" v-bind="cellAttrs(item, col)" @click="startEdit(item, col)"
                                    @keydown.enter.self="startEdit(item, col)">
                                    <TableCell v-bind="cellProps(item, col)" v-model="editValue" @save="saveEdit(col)" @cancel="cancelEdit"
                                        @file="handleFileChange($event, col)" />
                                </td>
                                <td v-if="showActions || detailColumns.length" class="col-actions" :data-label="actionsLabel">
                                    <div class="action-buttons">
                                        <IconButton v-if="detailColumns.length" icon="chevron-right" class="row-toggle"
                                            :label="t(isOpen(item) ? 'tableLess' : 'tableMore')" :aria-expanded="isOpen(item)" @click="toggle(item)" />
                                        <slot v-if="showActions" name="actions" :item="item">
                                            <IconButton v-if="showDownload" icon="download" :label="downloadLabel" @click="$emit('download', item)" />
                                            <IconButton v-if="showDelete" icon="trash" variant="danger" :label="deleteLabel" @click="$emit('delete', item)" />
                                        </slot>
                                    </div>
                                </td>
                            </tr>
                            <!-- The other values of the row, opened by its arrow: still editable -->
                            <Transition name="table-detail">
                            <tr v-if="isOpen(item)" class="table-detail text-body-s">
                                <td :colspan="span">
                                    <div class="table-detail__grid">
                                        <div v-for="(col, c) in detailColumns" :key="col.key" class="table-detail__cell" :style="{ '--i': c }" v-bind="cellAttrs(item, col)"
                                            @click="startEdit(item, col)" @keydown.enter.self="startEdit(item, col)">
                                            <span class="table-detail__label text-label">{{ col.label }}</span>
                                            <TableCell v-bind="cellProps(item, col)" v-model="editValue" @save="saveEdit(col)" @cancel="cancelEdit"
                                                @file="handleFileChange($event, col)" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            </Transition>
                        </template>
                    </template>
                    <!-- No data: an icon and the message, in the middle of the table -->
                    <tr v-if="!items.length" class="empty-row">
                        <td :colspan="span" class="empty">
                            <div class="empty-state">
                                <span class="empty-state__icon" aria-hidden="true"><i class="fas fa-inbox" /></span>
                                <p class="empty-state__text text-display-xs">{{ emptyMessage }}</p>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <TablePager v-if="perPage > 0" v-model="page" :total="items.length" :per-page="fitting" />
    </div>
</template>

<script setup>
import { padIndex } from '@/utils/display.js'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLang } from '@/composables/useLang.js'
import IconButton from '@/components/ui/Button/IconButton.vue'
import TableCell from '@/components/ui/Table/TableCell.vue'
import TablePager from '@/components/ui/Table/TablePager.vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    columns: { type: Array, required: true },
    itemKey: { type: String, default: 'id' },
    showActions: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
    showDownload: { type: Boolean, default: false },
    actionsLabel: { type: String, default: 'Actions' },
    deleteLabel: { type: String, default: 'Delete' },
    downloadLabel: { type: String, default: 'Download' },
    emptyMessage: { type: String, default: 'No data found' },
    // Rows per page at most (0: every row, the table scrolls); fewer when they do not all fit in the modal
    perPage: { type: Number, default: 0 },
})

const emit = defineEmits(['update', 'delete', 'download'])
const { getTranslation: t } = useLang()
const editingItem = ref(null), editingField = ref(''), editValue = ref('')
const tableWrapper = ref(null), hasScroll = ref(false)
const page = ref(1)
// Side the rows of a new page come from: 'next' (from the right), 'prev' (from the left), none at the opening
const turn = ref(null)
watch(page, (now, before) => { turn.value = now > before ? 'next' : 'prev' })
// Rows of a page that fit in the place given to the table (measured), at most perPage
const fitting = ref(props.perPage)
const opened = ref(new Set())
let observer = null

// Columns on the row, and the ones opened under it
const mainColumns = computed(() => props.columns.filter(col => !col.detail))
const detailColumns = computed(() => props.columns.filter(col => col.detail))
// Number of columns (the row number, the columns, the buttons): width of the title, detail and "no data" rows
const span = computed(() => mainColumns.value.length + 1 + (props.showActions || detailColumns.value.length ? 1 : 0))
// Rows of the page shown
const first = computed(() => props.perPage > 0 ? (page.value - 1) * fitting.value : 0)
const pageItems = computed(() => props.perPage > 0 ? props.items.slice(first.value, first.value + fitting.value) : props.items)
// Number of a row (01, 02...), the title rows of the groups not counted
const rowNumber = index => padIndex(props.items.slice(0, first.value + index + 1).filter(item => !item._section).length - 1)

const isOpen = item => opened.value.has(item[props.itemKey])
const toggle = item => {
    const next = new Set(opened.value)
    next.has(item[props.itemKey]) ? next.delete(item[props.itemKey]) : next.add(item[props.itemKey])
    opened.value = next
}

// Helpers: a column option can be a value or a function of the row (disabled, inputType)
const isFieldDisabled = (item, col) => typeof col.disabled === 'function' ? col.disabled(item) : col.disabled
const inputTypeOf = (item, col) => (typeof col.inputType === 'function' ? col.inputType(item) : col.inputType) || 'text'
// Value shown in a cell (the column's formatter when it has one), empty ("-", greyed out), and its tooltip
const getCellValue = (item, col) => col.formatter ? col.formatter(item) : item[col.key] ?? '-'
const isEmpty = (item, col) => ['', '-', null, undefined].includes(getCellValue(item, col))
const getCellTitle = (item, col) => col.tooltip ? (typeof col.tooltip === 'function' ? col.tooltip(item) : col.tooltip) : (col.processHtml ? null : getCellValue(item, col))

// Same attributes and props for a cell of the row and a cell opened under it
const cellAttrs = (item, col) => ({
    class: [isFieldDisabled(item, col) ? 'non-editable' : 'is-editable', { 'is-editing': isEditing(item, col.key) },
        col.mobile && `is-mobile-${col.mobile}`, { 'is-blank': isEmpty(item, col) && isFieldDisabled(item, col) }],
    // The name shown on a card of a phone (a short one when given: shortLabel)
    'data-label': col.shortLabel || col.label,
    tabindex: isFieldDisabled(item, col) ? undefined : 0,
    title: getCellTitle(item, col),
})
const cellProps = (item, col) => ({
    col, display: getCellValue(item, col), empty: isEmpty(item, col), disabled: isFieldDisabled(item, col),
    editing: isEditing(item, col.key), inputType: inputTypeOf(item, col),
})

// Starts inline edit
const startEdit = (item, col) => {
    if (isFieldDisabled(item, col) || isEditing(item, col.key)) return
    editingItem.value = item
    editingField.value = col.key
    editValue.value = col.editValue ? col.editValue(item) : item[col.key] ?? ''
}

const isEditing = (item, field) => Boolean(editingItem.value) && editingItem.value[props.itemKey] === item[props.itemKey] && editingField.value === field

const cancelEdit = () => {
    editingItem.value = null
    editingField.value = ''
    editValue.value = ''
}

// Saves edit, using full item from editingItem
const saveEdit = col => {
    if (!editingItem.value) return
    const fullItem = editingItem.value
    const val = editValue.value
    const finalVal = col.type === 'select' && col.multiple ? (Array.isArray(val) ? val : [val]) : val
    cancelEdit()
    emit('update', { item: fullItem, field: col.key, value: finalVal, column: col })
}

// File column: the picked file is sent at once
const handleFileChange = (event, col) => {
    const file = event.target.files[0]
    if (!file || !editingItem.value) return
    emit('update', { item: editingItem.value, field: col.key, value: file.name, file, column: col })
    cancelEdit()
}

// Observe scroll (a table without pages): room is kept for the scrollbar
const checkScroll = () => tableWrapper.value && (hasScroll.value = tableWrapper.value.scrollHeight > tableWrapper.value.clientHeight)
const createObserver = () => {
    if (!tableWrapper.value) return
    destroyObserver()
    observer = new MutationObserver(() => setTimeout(checkScroll, 50))
    observer.observe(tableWrapper.value, { childList: true, subtree: true, characterData: true })
    checkScroll()
}
const destroyObserver = () => { observer?.disconnect(); observer = null }

// In pages: as many rows as the place of the table holds (no scrollbar), measured once the rows are shown
const fit = async () => {
    if (!props.perPage) return
    fitting.value = props.perPage
    await nextTick()
    const wrapper = tableWrapper.value
    if (!wrapper?.querySelector('.table-row') || wrapper.scrollHeight <= wrapper.clientHeight + 1) return
    const head = getComputedStyle(wrapper.querySelector('thead')).display === 'none' ? 0 : wrapper.querySelector('thead').offsetHeight
    // The pages bar is not shown yet (one page so far): its place (its height and the gap above it) is kept for it
    const pager = props.items.length > props.perPage ? 0 : 56
    const rows = [...wrapper.querySelectorAll('.table-row')].slice(0, 3)
    const rowHeight = Math.max(...rows.map(r => r.offsetHeight))
    fitting.value = Math.max(1, Math.floor((wrapper.clientHeight - head - pager) / rowHeight))
}
const onResize = () => { checkScroll(); fit() }

// Measured before the first picture of the table: never a scrollbar showing for a moment
onMounted(() => { fit(); window.addEventListener('resize', onResize) })
onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
    destroyObserver()
})

// A new search or a row removed: back to the first page, the rows that fit measured again (right after the table is
// drawn, before it shows)
watch(() => props.items.length, () => { page.value = 1; fit() }, { flush: 'post' })
watch(() => props.items.length, len => len > 0 ? setTimeout(createObserver, 100) : (destroyObserver(), hasScroll.value = false), { immediate: true })

defineExpose({ cancelEdit })
</script>
