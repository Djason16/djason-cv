<template>
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
                        <!-- Edit mode -->
                        <template v-if="isEditing(item, col.key)">
                            <select v-if="col.type === 'select'" v-model="editValue" @change="saveEdit(item, col)">
                                <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}
                                </option>
                            </select>
                            <input v-else-if="!isFieldDisabled(item, col)" :name="`item-${item[itemKey]}-${col.key}`"
                                v-model="editValue" :type="col.inputType || 'text'"
                                :autocomplete="col.autocomplete || 'off'" :autocapitalize="col.autocapitalize || 'none'"
                                @keyup.enter="saveEdit(item, col)" @keyup.esc="cancelEdit" />
                        </template>
                        <!-- Read-only mode -->
                        <span v-else v-html="getCellValue(item, col)"></span>
                    </td>
                    <td v-if="showActions" :data-label="actionsLabel">
                        <slot name="actions" :item="item">
                            <button v-if="showDelete" class="delete-btn" :title="deleteLabel"
                                @click="$emit('delete', item)">
                                <i class="fas fa-trash"></i>
                            </button>
                        </slot>
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
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    items: { type: Array, default: () => [] },
    columns: { type: Array, required: true },
    itemKey: { type: String, default: 'id' },
    showActions: { type: Boolean, default: true },
    showDelete: { type: Boolean, default: true },
    actionsLabel: { type: String, default: 'Actions' },
    deleteLabel: { type: String, default: 'Delete' },
    emptyMessage: { type: String, default: 'No data found' }
})
const emit = defineEmits(['update', 'delete'])

const editingItem = ref(null), editingField = ref(''), editValue = ref('')
const tableWrapper = ref(null), hasScroll = ref(false)

const isFieldDisabled = (item, col) => typeof col.disabled === 'function' ? col.disabled(item) : col.disabled
const getCellValue = (item, col) => col.formatter ? col.formatter(item) : item[col.key] ?? '-'
const getCellTitle = (item, col) => col.tooltip ? (typeof col.tooltip === 'function' ? col.tooltip(item) : col.tooltip) : (col.processHtml ? null : getCellValue(item, col))

// Handle edit start / cancel / save
const startEdit = (item, col) => { if (isFieldDisabled(item, col)) return; editingItem.value = item; editingField.value = col.key; editValue.value = col.editValue ? col.editValue(item) : item[col.key] || '' }
const isEditing = (item, field) => editingItem.value === item && editingField.value === field
const cancelEdit = () => { editingItem.value = null; editingField.value = ''; editValue.value = '' }
const saveEdit = (item, col) => { if (!editingItem.value) return; const val = editValue.value; const field = col.key; cancelEdit(); emit('update', { item, field, value: val, column: col }) }

// Cancel edit when clicking outside
const handleClickOutside = e => editingItem.value && tableWrapper.value && !tableWrapper.value.contains(e.target) && cancelEdit()

// Scroll detection (to toggle padding)
const checkScroll = () => tableWrapper.value && (hasScroll.value = tableWrapper.value.scrollHeight > tableWrapper.value.clientHeight)

let observer
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', checkScroll)
    checkScroll()
    if (tableWrapper.value) {
        observer = new MutationObserver(() => setTimeout(checkScroll, 50))
        observer.observe(tableWrapper.value, { childList: true, subtree: true, characterData: true })
    }
})
onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', checkScroll)
    observer?.disconnect()
})
watch(() => props.items.length, () => setTimeout(checkScroll, 100))

defineExpose({ cancelEdit })
</script>

<style scoped>
.editable-table-wrapper {
    overflow: auto;
    max-height: 60vh;
    transition: all 0.3s ease
}

.editable-table-wrapper.has-scroll {
    padding-right: 1rem
}

.editable-table {
    width: 100%;
    min-width: 700px;
    border-collapse: collapse;
    background: var(--first-color)
}

.editable-table thead {
    background: var(--third-color);
    color: var(--text-color-light);
    letter-spacing: 0.05em;
    position: sticky;
    top: 0;
    z-index: 2
}

.editable-table th,
.editable-table td {
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid var(--second-color);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis
}

.editable-table td {
    cursor: default
}

.editable-table td:not(.non-editable):not(:last-child) {
    cursor: pointer
}

.editable-table td ::v-deep(a) {
    color: var(--text-color-dark);
    position: relative
}

.editable-table td ::v-deep(a)::after {
    background-color: var(--text-color-dark)
}

.delete-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    color: var(--text-color-grey);
    transition: all 0.2s ease;
    border-radius: 4px
}

.delete-btn:hover {
    color: var(--accent-red);
    background-color: rgba(231, 76, 60, 0.1)
}

.empty {
    text-align: center;
    padding: 2rem;
    color: var(--text-color-grey)
}

@media(max-width:1440px) {
    .editable-table {
        min-width: 100%;
        display: block;
        border: none;
        background: transparent;
    }

    .editable-table thead {
        display: none
    }

    .editable-table tbody {
        display: block
    }

    .editable-table tr {
        display: block;
        margin-bottom: 1rem;
        border: 1px solid var(--second-color);
        background: var(--first-color);
        padding: 1rem 1rem 0;
    }

    .editable-table tr:last-child {
        margin-bottom: 0
    }

    .editable-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        white-space: normal;
        text-align: right
    }

    .editable-table td:last-child {
        border-bottom: none
    }

    .editable-table td::before {
        content: attr(data-label);
        font-weight: 600;
        text-transform: uppercase;
        font-size: 0.85em;
        color: var(--text-color-grey);
        flex: 0 0 40%;
        text-align: left;
        padding-right: 1rem
    }

    .editable-table td input,
    .editable-table td select {
        max-width: 60%
    }

    .delete-btn:hover {
        color: var(--text-color-grey);
        background: transparent
    }

    .empty {
        display: block;
        border: none
    }
}

@media(max-width:768px) {
    .editable-table-wrapper {
        max-height: 50vh
    }

    .editable-table td {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem
    }

    .editable-table td::before {
        flex: none;
        padding-right: 0
    }

    .editable-table td input,
    .editable-table td select {
        max-width: 100%;
        width: 100%
    }

    .delete-btn {
        padding: .5rem .5rem .5rem 0;
    }
}
</style>