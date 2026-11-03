<template>
    <!-- New mission of any client: time spent (hourly rate × duration × quantity) or a fixed price; put later on an invoice
         with the others picked (Quotes & invoices > invoice > Import missions) -->
    <FormModal :show="show" :title="t('addMission')" :message="translatedMessage" :loading="formLoading" :columns="2"
        @close="close" @submit="handleSubmit">
        <p class="is-wide mission-hint text-body-s">{{ t('missionHint') }}</p>

        <div class="form-group">
            <label for="client">{{ t('client') }}</label>
            <select id="client" v-model="form.clientId" required :aria-label="t('client')">
                <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.company_name || [c.firstname, c.lastname].filter(Boolean).join(' ') || '-' }}</option>
            </select>
        </div>
        <div class="form-group">
            <label for="title">{{ t('missionTitle') }}</label>
            <input id="title" v-model="form.title" type="text" :placeholder="t('enterMissionTitle')" required :aria-label="t('missionTitle')" />
        </div>
        <!-- Optional: printed under the title on the invoice, after the date -->
        <div class="form-group is-wide">
            <label for="description">{{ t('missionDescription') }}</label>
            <input id="description" v-model="form.description" type="text" maxlength="200" :placeholder="t('missionDescriptionPlaceholder')" :aria-label="t('missionDescription')" />
        </div>

        <div class="form-group">
            <label for="date">{{ t('missionDate') }}</label>
            <input id="date" v-model="form.date" type="date" required :aria-label="t('missionDate')" />
        </div>
        <div class="form-group">
            <label for="pricingMode">{{ t('pricingMode') }}</label>
            <select id="pricingMode" v-model="pricingMode">
                <option value="tjm">{{ t('pricingModeTjm') }}</option>
                <option value="manual">{{ t('pricingModeManual') }}</option>
            </select>
        </div>

        <!-- Time spent: the rate and the duration make the price -->
        <template v-if="pricingMode === 'tjm'">
            <div class="form-group">
                <label for="tjm">{{ t('hourlyRate') }}</label>
                <input id="tjm" v-model.number="form.tjm" type="number" min="0" step="0.01" :placeholder="t('enterHourlyRate')" :aria-label="t('hourlyRate')" />
            </div>
            <div class="form-group">
                <label for="duration">{{ t('missionDuration') }}</label>
                <select id="duration" v-model="duration" :aria-label="t('missionDuration')">
                    <option v-for="opt in DURATION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                </select>
            </div>
        </template>

        <div class="form-group">
            <label for="quantity">{{ t('quantity') }}</label>
            <input id="quantity" v-model.number="form.quantity" type="number" min="1" step="1" required :aria-label="t('quantity')" />
        </div>
        <div class="form-group">
            <label for="unitPrice">{{ form.quantity > 1 ? t('totalAmount') : t('unitPrice') }}</label>
            <input id="unitPrice" v-model.number="form.unitPrice" type="number" min="0" step="0.01" required :readonly="pricingMode === 'tjm'"
                :class="{ 'input-readonly': pricingMode === 'tjm' }" :aria-label="t('unitPrice')" />
        </div>

        <div class="form-group is-wide">
            <label for="tvaApplicable" class="mission-vat">
                <input id="tvaApplicable" v-model="form.tvaApplicable" type="checkbox" /> {{ t('tvaApplicable') }}
            </label>
        </div>
    </FormModal>
</template>

<script setup>
import { MESSAGE_DELAY, afterMessage } from '@/utils/feedback.js'
import { reactive, ref, watch } from 'vue'
import FormModal from '@/components/ui/Modal/FormModal.vue'
import { useLang } from '@/composables/useLang.js'
import { useMessage } from '@/composables/useMessage.js'
import { useMissions } from '@/composables/useMissions.js'
import { todayIso } from '@/utils/display.js'
import { DURATION_OPTIONS } from '@/utils/durationOptions.js'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

const { getTranslation: t } = useLang()
const { clients, fetchFormData, createMission } = useMissions()
const { translatedMessage, showMessage, clearMessage } = useMessage()

// 30 € an hour, 7 hours: a day of work, until changed
const DEFAULT_RATE = 30
const empty = () => ({ clientId: '', title: '', description: '', date: todayIso(), tjm: DEFAULT_RATE, quantity: 1, unitPrice: 0, tvaApplicable: false })
const form = reactive(empty())
const duration = ref('7.00')
const pricingMode = ref('tjm')
const formLoading = ref(false)

// Time spent: price = rate × duration × quantity, always up to date
const computePrice = () => {
    if (pricingMode.value === 'tjm') form.unitPrice = Math.round((Number(form.tjm) || 0) * (parseFloat(duration.value) || 0) * (Number(form.quantity) || 1) * 100) / 100
}
watch([() => form.tjm, duration, () => form.quantity, pricingMode], computePrice)

watch(() => props.show, async open => {
    if (!open) return
    formLoading.value = true
    await fetchFormData()
    Object.assign(form, empty(), { clientId: clients.value[0]?.id || '' })
    duration.value = '7.00'
    pricingMode.value = 'tjm'
    computePrice()
    formLoading.value = false
}, { immediate: true })

const close = () => { clearMessage(); formLoading.value = false; emit('close') }

// Saved with its rate (time spent) or a rate of 0 (fixed price)
const handleSubmit = async () => {
    clearMessage()
    formLoading.value = true
    const res = await createMission({ ...form, duration: pricingMode.value === 'tjm' ? parseFloat(duration.value) : 0, tjm: pricingMode.value === 'tjm' ? form.tjm : 0 })
    formLoading.value = false
    if (!res.success) return showMessage('error', t('errorSavingMission'), 0)
    showMessage('success', t('missionAdded'), MESSAGE_DELAY)
    await afterMessage()
    close()
    emit('saved')
}
</script>

<style scoped>
.mission-hint {
    margin: 0;
    color: var(--fg-muted);
}

.mission-vat {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: fit-content;
}

/* Price computed from the rate: read only */
.input-readonly {
    opacity: 0.6;
    cursor: not-allowed;
}
</style>
