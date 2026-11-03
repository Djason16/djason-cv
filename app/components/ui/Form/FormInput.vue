<template>
    <!--
        Field of the site (login, payment, admin): a text field, or a list when "options" is given.
        A password field gets a show / hide button inside it. Look: assets/css/components/form-field.css.
    -->
    <div class="form-input" :class="{ 'has-toggle': type === 'password' }">
        <select v-if="options" :id="id" v-model="model" class="form-input__control" v-bind="$attrs">
            <option v-for="option in options" :key="option.value" :value="option.value" :title="option.label">
                {{ option.label }}
            </option>
        </select>

        <input v-else :id="id" v-model="model" class="form-input__control" v-bind="$attrs"
            :type="type === 'password' && shown ? 'text' : type" @keyup.enter="emit('enter')" />

        <button v-if="type === 'password'" type="button" class="form-input__toggle" :title="toggleLabel"
            :aria-label="toggleLabel" :aria-pressed="shown" @click="shown = !shown">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
                <circle cx="12" cy="12" r="3" />
                <path v-if="shown" d="M4 4l16 16" />
            </svg>
        </button>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLang } from '@/composables/useLang.js'

// Attributes (placeholder, autocomplete, min, required, aria-label...) go on the field itself
defineOptions({ inheritAttrs: false })

defineProps({
    id: { type: String, required: true },
    type: { type: String, default: 'text' },
    // [{ value, label }]: a list instead of a text field
    options: { type: Array, default: null },
})
const emit = defineEmits(['enter'])
const model = defineModel({ type: [String, Number], default: '' })

const { getTranslation: t } = useLang()
const shown = ref(false)
const toggleLabel = computed(() => t(shown.value ? 'hidePassword' : 'showPassword'))

// Hides the password again (after a sent form)
defineExpose({ hide: () => { shown.value = false } })
</script>
