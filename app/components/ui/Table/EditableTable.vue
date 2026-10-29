<template>
    <!-- Table of the admin modals: a click on a cell edits it, optional delete / download buttons (style: assets/css/components/editable-table.css) -->
    <div ref="tableWrapper" :class="{ 'has-scroll': hasScroll }" class="editable-table-wrapper">
        <table class="editable-table">
            <thead>
                <tr class="text-small text-uppercase">
                    <th v-for="col in columns" :key="col.key" :title="col.label">{{ col.label }}</th>
                    <th v-if="showActions">{{ actionsLabel }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in items" :key="item[itemKey]" class="table-row text-normal">
                    <td v-for="col in columns" :key="col.key" :class="{ 'non-editable': isFieldDisabled(item, col) }"
                        :data-label="col.label" @click="startEdit(item, col)" :title="getCellTitle(item, col)">
                        <!-- Inline edit input -->
                        <template v-if="isEditing(item, col.key)">
                            <!-- Select multiple -->
                            <div v-if="col.type === 'select' && col.multiple" class="select-multiple-container"
                                @click.stop @mousedown.stop>
                                <select ref="editInput" v-model="editValue" multiple size="5">
                                    <option v-for="opt in col.options" :key="opt.value" :value="opt.value">
                                        {{ opt.label }}
                                    </option>
                                </select>
                            </div>

                            <!-- Select simple -->
                            <select v-else-if="col.type === 'select'" ref="editInput" v-model="editValue"
                                @change="saveEdit(col)">
                                <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}
                                </option>
                            </select>

                            <!-- File input -->
                            <input v-else-if="col.type === 'file'" type="file" ref="editInput"
                                @change="handleFileChange($event, col)" />

                            <!-- Text / number / date etc -->
                            <input v-else ref="editInput" v-model="editValue" :type="col.inputType || 'text'"
                                :autocomplete="col.autocomplete || 'off'" :step="col.step" :min="col.min" :max="col.max"
                                :autocapitalize="col.autocapitalize || 'none'" @keyup.enter="saveEdit(col)"
                                @keyup.esc="cancelEdit" @blur="saveEdit(col)" />
                        </template>
                        <!-- Read-only display -->
                        <span v-else v-html="getCellValue(item, col)"></span>
                    </td>
                    <td v-if="showActions" :data-label="actionsLabel">
                        <div class="action-buttons">
                            <slot name="actions" :item="item">
                                <button v-if="showDownload" class="download-btn" :title="downloadLabel"
                                    @click="$emit('download', item)">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button v-if="showDelete" class="delete-btn" :title="deleteLabel"
                                    @click="$emit('delete', item)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </slot>
                        </div>
                    </td>
                </tr>
                <tr v-if="!items.length">
                    <td :colspan="columns.length + (showActions ? 1 : 0)" class="empty">{{ emptyMessage }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

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
    emptyMessage: { type: String, default: 'No data found' }
})

const emit = defineEmits(['update', 'delete', 'download'])
const editingItem = ref(null), editingField = ref(''), editValue = ref('')
const tableWrapper = ref(null), hasScroll = ref(false), editInput = ref(null)
const isEditingMultipleSelect = ref(false)
const justStartedEditing = ref(false)
let observer = null

// Helpers
const isFieldDisabled = (item, col) => typeof col.disabled === 'function' ? col.disabled(item) : col.disabled
// Value shown in a cell (the column's formatter when it has one) and its tooltip
const getCellValue = (item, col) => col.formatter ? col.formatter(item) : item[col.key] ?? '-'
const getCellTitle = (item, col) => col.tooltip ? (typeof col.tooltip === 'function' ? col.tooltip(item) : col.tooltip) : (col.processHtml ? null : getCellValue(item, col))

// Starts inline edit
const startEdit = (item, col) => {
    if (isFieldDisabled(item, col)) return
    editingItem.value = item
    editingField.value = col.key
    editValue.value = col.editValue ? col.editValue(item) : item[col.key] ?? ''
    isEditingMultipleSelect.value = col.type === 'select' && col.multiple
    justStartedEditing.value = true
    setTimeout(() => {
        justStartedEditing.value = false
    }, 100)
    nextTick(() => {
        const input = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value
        input?.focus?.()
    })
}

// Checks if cell is being edited
const isEditing = (item, field) => {
    if (!editingItem.value) return false
    const isSameItem = editingItem.value[props.itemKey] === item[props.itemKey]
    const isSameField = editingField.value === field
    return isSameItem && isSameField
}

// Cancels editing
const cancelEdit = () => {
    editingItem.value = null
    editingField.value = ''
    editValue.value = ''
    isEditingMultipleSelect.value = false
    justStartedEditing.value = false
}

// Saves edit, using full item from editingItem
const saveEdit = col => {
    if (!editingItem.value) return
    const fullItem = editingItem.value
    const val = editValue.value
    let finalVal = val
    if (col.type === 'select' && col.multiple) {
        finalVal = Array.isArray(val) ? val : [val]
    }
    cancelEdit()
    emit('update', { item: fullItem, field: col.key, value: finalVal, column: col })
}

// Click outside to save
const handleClickOutside = e => {
    if (!editingItem.value || !tableWrapper.value) return
    if (justStartedEditing.value) return
    if (isEditingMultipleSelect.value) {
        const isInsideSelect = e.target.closest('.select-multiple-container')
        if (isInsideSelect) return
        const col = props.columns.find(c => c.key === editingField.value)
        if (col) {
            saveEdit(col)
        }
    } else {
        if (!tableWrapper.value.contains(e.target)) {
            const col = props.columns.find(c => c.key === editingField.value)
            if (col) saveEdit(col)
        }
    }
}

// File column: the picked file is sent at once
const handleFileChange = (event, col) => {
    const file = event.target.files[0]
    if (!file) return
    editValue.value = file
    if (editingItem.value) {
        emit('update', { item: editingItem.value, field: col.key, value: file.name, file, column: col })
        cancelEdit()
    }
}

// Observe scroll
const checkScroll = () => tableWrapper.value && (hasScroll.value = tableWrapper.value.scrollHeight > tableWrapper.value.clientHeight)
// Rows added or removed change the height: the scroll check runs again
const createObserver = () => {
    if (!tableWrapper.value) return
    destroyObserver()
    observer = new MutationObserver(() => setTimeout(checkScroll, 50))
    observer.observe(tableWrapper.value, { childList: true, subtree: true, characterData: true })
    checkScroll()
}
const destroyObserver = () => { observer?.disconnect(); observer = null }

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', checkScroll)
})
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', checkScroll)
    destroyObserver()
})

// Watches for items to trigger scroll observer
watch(() => props.items.length, len => len > 0 ? setTimeout(createObserver, 100) : (destroyObserver(), hasScroll.value = false), { immediate: true })

defineExpose({ cancelEdit })
</script>
