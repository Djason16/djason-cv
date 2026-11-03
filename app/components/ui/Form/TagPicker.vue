<template>
    <!--
        Several values as tags (e.g. the skills of a project): the picked ones with a cross to remove them,
        a field that suggests the known values as you type, Enter (or a comma) adds the typed text, even a new one.
        v-model: an array of values; options: [{ value, label }] (a value not in the options shows as itself).
    -->
    <div class="tag-picker">
        <ul v-if="model.length" class="tag-picker__tags">
            <li v-for="value in model" :key="value" class="tag-picker__tag text-label">
                <span>{{ labelOf(value) }}</span>
                <button type="button" class="tag-picker__remove" :aria-label="`${removeLabel} ${labelOf(value)}`" @click="remove(value)">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </li>
        </ul>

        <input :id="id" v-model="query" type="text" autocomplete="off" :placeholder="placeholder" :aria-label="placeholder"
            @keydown="onKey" />

        <!-- Known values that match the text (all of them while the field is empty, the first ones) -->
        <div v-if="suggestions.length" class="tag-picker__suggestions">
            <button v-for="option in suggestions" :key="option.value" type="button" class="tag-picker__suggestion text-body-s"
                @click="add(option.value)">+ {{ option.label }}</button>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
    id: { type: String, default: undefined },
    options: { type: Array, default: () => [] },
    placeholder: { type: String, default: '' },
    removeLabel: { type: String, default: 'Remove' },
    // Number of suggestions shown at once
    limit: { type: Number, default: 12 },
})
const model = defineModel({ type: Array, default: () => [] })
const query = ref('')

const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase()
const labelOf = value => props.options.find(option => option.value === value)?.label || value

// Not picked yet, and matching the typed text
const suggestions = computed(() => {
    const q = query.value.trim().toLowerCase()
    return props.options
        .filter(option => !model.value.some(value => value === option.value || same(labelOf(value), option.label)))
        .filter(option => !q || option.label.toLowerCase().includes(q))
        .slice(0, props.limit)
})

const add = value => {
    if (value && !model.value.some(picked => same(labelOf(picked), labelOf(value)))) model.value = [...model.value, value]
    query.value = ''
}

// The typed text: a known value when its name matches, otherwise a new one
const addTyped = () => {
    const text = query.value.trim()
    if (!text) return
    add(props.options.find(option => same(option.label, text))?.value || text)
}

// Enter or a comma adds the typed text, Backspace in an empty field removes the last tag
const onKey = event => {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addTyped() }
    else if (event.key === 'Backspace') removeLast()
}

const remove = value => { model.value = model.value.filter(picked => picked !== value) }
const removeLast = () => { if (!query.value && model.value.length) remove(model.value[model.value.length - 1]) }
</script>

<style scoped>
.tag-picker {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.tag-picker__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

/* A picked value: a mint tag with its cross */
.tag-picker__tag {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.4rem 0.35rem 0.7rem;
    background: rgba(126, 230, 168, 0.1);
    color: var(--mint);
}

.tag-picker__remove {
    display: grid;
    place-items: center;
    width: 1.3rem;
    height: 1.3rem;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font-size: 0.75em;
    cursor: pointer;
    opacity: 0.7;
}

.tag-picker__remove:hover,
.tag-picker__remove:focus-visible {
    opacity: 1;
}

/* Suggestions: small quiet buttons under the field */
.tag-picker__suggestions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
}

.tag-picker__suggestion {
    padding: 0.3rem 0.6rem;
    border: none;
    background: rgba(255, 255, 255, 0.05);
    color: var(--paper-muted);
    cursor: pointer;
    transition: background-color var(--motion-fast) var(--ease), color var(--motion-fast) var(--ease);
}

.tag-picker__suggestion:hover,
.tag-picker__suggestion:focus-visible {
    background: rgba(126, 230, 168, 0.12);
    color: var(--mint);
}
</style>
