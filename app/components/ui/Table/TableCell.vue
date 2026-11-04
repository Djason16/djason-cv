<template>
    <!-- Content of one cell of EditableTable: its value (with a pencil when it can be changed), or its field while edited,
         saved with its Save button or Enter (Ctrl + Enter in a long text), Escape or Cancel to leave -->
    <div v-if="editing" class="cell-editor" @click.stop @keydown.esc.stop="emit('cancel')">
        <!-- Select multiple -->
        <div v-if="col.type === 'select' && col.multiple" class="select-multiple-container">
            <select ref="input" v-model="value" multiple size="5">
                <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
        </div>

        <!-- Select simple -->
        <select v-else-if="col.type === 'select'" ref="input" v-model="value">
            <option v-for="opt in col.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>

        <!-- File input: the picked file is sent at once -->
        <input v-else-if="col.type === 'file'" ref="input" type="file" @change="emit('file', $event)" />

        <!-- Long text: Ctrl + Enter saves -->
        <textarea v-else-if="inputType === 'textarea'" ref="input" v-model="value" rows="4" @keydown.ctrl.enter.prevent="emit('save')" />

        <!-- Text / number / date etc: Enter saves -->
        <input v-else ref="input" v-model="value" :type="inputType" :autocomplete="col.autocomplete || 'off'" :step="col.step" :min="col.min"
            :max="col.max" :autocapitalize="col.autocapitalize || 'none'" @keydown.enter.prevent="emit('save')" />

        <div v-if="col.type !== 'file'" class="cell-editor__actions">
            <IconButton icon="check" variant="primary" :label="t('save')" @click="emit('save')" />
            <IconButton icon="close" :label="t('cancel')" @click="emit('cancel')" />
        </div>
    </div>
    <span v-else class="cell-content">
        <span class="cell-value" :class="{ 'is-empty': empty }" v-html="safeDisplay"></span>
        <i v-if="!disabled" class="fas fa-pen cell-edit-icon" aria-hidden="true"></i>
    </span>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import IconButton from '@/components/ui/Button/IconButton.vue'
import { useLang } from '@/composables/useLang.js'

const props = defineProps({
    col: { type: Object, required: true },
    // Value shown (HTML of the column's formatter), and whether it is empty
    display: { type: [String, Number], default: '' },
    empty: Boolean,
    disabled: Boolean,
    editing: Boolean,
    inputType: { type: String, default: 'text' },
})
const emit = defineEmits(['save', 'cancel', 'file'])
// v-model: the value being edited
const value = defineModel({ default: '' })
const { getTranslation: t } = useLang()
const input = ref(null)

// HTML only for the columns that build it themselves (processHtml) ; any other value is shown as text, never run
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const safeDisplay = computed(() => props.col.processHtml ? props.display : escapeHtml(props.display))

// The field gets the focus as soon as the cell is edited
const focus = () => nextTick(() => input.value?.focus?.())
watch(() => props.editing, editing => editing && focus())
onMounted(() => props.editing && focus())
</script>
