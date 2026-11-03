<template>
    <!-- Numbers of the quotes, invoices and contracts: prefix, format, figures and a number to go on from, per type,
         with the next number shown live (utils/numbering.js; saved in admin settings, key "numbering") -->
    <FormModal :show="show" :title="t('numberingTitle')" :message="translatedMessage" :loading="saving" :columns="3"
        @close="emit('close')" @submit="save">
        <p class="numbering__hint is-wide text-body-s">{{ t('numberingHint') }}</p>

        <fieldset v-for="type in NUMBERING_TYPES" :key="type" class="numbering-type">
            <legend class="eyebrow">{{ t(`numberingType_${type}`) }}</legend>

            <div class="form-group">
                <label :for="`num-prefix-${type}`">{{ t('numberingPrefix') }}</label>
                <input :id="`num-prefix-${type}`" v-model="form[type].prefix" type="text" maxlength="8" :list="`num-prefixes-${type}`"
                    autocomplete="off" @input="form[type].prefix = form[type].prefix.toUpperCase()" />
                <datalist :id="`num-prefixes-${type}`">
                    <option v-for="p in PREFIXES[type]" :key="p" :value="p" />
                </datalist>
            </div>

            <div class="form-group">
                <label :for="`num-format-${type}`">{{ t('numberingFormat') }}</label>
                <select :id="`num-format-${type}`" v-model="formatChoice[type]">
                    <option v-for="f in NUMBER_FORMATS" :key="f" :value="f">{{ example(type, f) }}</option>
                    <option value="custom">{{ t('numberingCustom') }}</option>
                </select>
                <input v-if="formatChoice[type] === 'custom'" v-model="form[type].format" type="text" placeholder="{P}-{YYYY}-{N}"
                    :aria-label="t('numberingCustom')" autocomplete="off" />
            </div>

            <div class="form-group">
                <label :for="`num-digits-${type}`">{{ t('numberingDigits') }}</label>
                <select :id="`num-digits-${type}`" v-model.number="form[type].digits">
                    <option v-for="d in [2, 3, 4, 5, 6]" :key="d" :value="d">{{ d }} ({{ '1'.padStart(d, '0') }})</option>
                </select>
            </div>

            <div class="form-group">
                <label :for="`num-start-${type}`">{{ t('numberingStartFrom') }}</label>
                <input :id="`num-start-${type}`" v-model="form[type].startFrom" type="text" autocomplete="off"
                    :placeholder="example(type, settingsOf(type).format)" @input="form[type].startFrom = form[type].startFrom.toUpperCase()" />
                <small v-if="startOutside(type)" class="numbering__warn text-body-s">{{ t('numberingStartOutside') }}</small>
            </div>

            <!-- What the next document of this type will get (the documents already numbered count) -->
            <p class="numbering__next">
                <span class="text-label">{{ t('numberingNext') }}</span>
                <strong class="text-display-xs">{{ next(type) }}</strong>
            </p>
        </fieldset>
    </FormModal>
</template>

<script setup>
import { todayIso } from '@/utils/display.js'
import { reactive, ref, watch } from 'vue'
import FormModal from '@/components/ui/Modal/FormModal.vue'
import { useLang } from '@/composables/useLang.js'
import { useMessage } from '@/composables/useMessage.js'
import { useBillingStore } from '@/stores/billing.js'
import { useSiteSettingsStore } from '@/stores/siteSettings.js'
import { NUMBERING_TYPES, NUMBER_FORMATS, counterOf, formatNumber, nextNumber, numberingOf } from '@/utils/numbering.js'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { getTranslation: t } = useLang()
const { translatedMessage, showMessage, clearMessage } = useMessage()
const siteSettings = useSiteSettingsStore()
const billing = useBillingStore()

// Prefixes suggested (any other one can be typed)
const PREFIXES = { quote: ['DE', 'D', 'DEV', 'Q'], invoice: ['FA', 'F', 'FAC', 'INV'], contract: ['CO', 'C', 'CT', 'CON'] }
const today = () => todayIso()
const form = reactive(Object.fromEntries(NUMBERING_TYPES.map(type => [type, numberingOf(type, '')])))
const formatChoice = reactive({})
const saving = ref(false)

const settingsOf = type => numberingOf(type, { [type]: form[type] })
// A format shown as a number of today: DE-2026-0001
const example = (type, format) => formatNumber(numberingOf(type, { [type]: { ...form[type], format } }), today(), 1)
const used = type => billing.documents.filter(d => d.type === type && d.number).map(d => d.number)
const next = type => nextNumber(type, today(), { [type]: form[type] }, used(type))
// A number to go on from that is not of the series of today (another prefix, format or year): it has no effect
const startOutside = type => Boolean(form[type].startFrom) && counterOf(form[type].startFrom, settingsOf(type), today()) === null

// The picked format, or a custom one
watch(formatChoice, choice => {
    for (const type of NUMBERING_TYPES) if (choice[type] && choice[type] !== 'custom') form[type].format = choice[type]
}, { deep: true })

// Each opening: the saved settings and the numbers already used
watch(() => props.show, open => {
    if (!open) return
    clearMessage()
    for (const type of NUMBERING_TYPES) {
        Object.assign(form[type], numberingOf(type, siteSettings.values.numbering))
        formatChoice[type] = NUMBER_FORMATS.includes(form[type].format) ? form[type].format : 'custom'
    }
    billing.load()
}, { immediate: true })

const save = async () => {
    clearMessage()
    if (NUMBERING_TYPES.some(type => !form[type].prefix || !form[type].format.includes('{N}'))) return showMessage('error', 'numberingInvalid', 0)
    saving.value = true
    const value = Object.fromEntries(NUMBERING_TYPES.map(type => [type, settingsOf(type)]))
    const res = await siteSettings.save({ numbering: JSON.stringify(value) })
    saving.value = false
    if (!res.success) return showMessage('error', 'saveFailed', 0)
    showMessage('success', 'numberingSaved', 1500)
}
</script>

<style scoped>
.numbering__hint {
    margin: 0;
    color: var(--fg-muted);
}

/* One type: a column of fields under its mint label, its next number at the bottom */
.numbering-type {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;
    margin: 0;
    padding: 1.1rem 1.25rem 1.2rem;
    border: none;
    background: var(--panel);
}

.numbering-type legend {
    float: left;
    padding: 0;
    color: var(--mint);
}

.numbering-type legend + * {
    clear: both;
}

.numbering__warn {
    color: #ffb4a8;
}

.numbering__next {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: auto 0 0;
    padding-top: 0.8rem;
    border-top: 1px solid var(--line);
}

.numbering__next strong {
    color: var(--mint);
}
</style>
