<template>
    <!-- New mission: TJM or manual pricing for professionals -->
    <FormModal :show="show" :title="t('addMission')" :message="translatedMessage" :loading="formLoading"
        @close="close" @submit="handleSubmit">

        <!-- Client selector -->
        <div class="form-group">
            <label for="client">{{ t('client') }}</label>
            <select id="client" name="client" v-model="refsMap.clientId" required
                :title="t('client')" :aria-label="t('client')">
                <option v-for="c in clients" :key="c.id" :value="c.id">
                    {{ c.company_name || [c.firstname, c.lastname].filter(Boolean).join(' ') || '-' }}
                </option>
            </select>
        </div>

        <!-- Conditional service or title input -->
        <div class="row-group">
            <div v-if="isIndividual" class="form-group">
                <label for="service">{{ t('selectService') }}</label>
                <select id="service" name="service" v-model="refsMap.serviceId" required
                    :title="t('selectService')"
                    :aria-label="t('selectService')">
                    <option v-for="s in availableServices" :key="s.id" :value="s.id">{{ displayServiceName(s) }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label for="title">{{ t('missionTitle') }}</label>
                <input id="title" name="title" v-model="refsMap.title" type="text"
                    :placeholder="t('enterMissionTitle')" required
                    :title="t('missionTitle')"
                    :aria-label="t('missionTitle')" />
            </div>
        </div>

        <!-- Date -->
        <div class="form-group">
            <label for="date">{{ t('missionDate') }}</label>
            <input id="date" name="date" v-model="refsMap.date" type="date" required
                :title="t('missionDate')" :aria-label="t('missionDate')" />
        </div>

        <!-- Pricing mode toggle — only for professional clients -->
        <div v-if="!isIndividual" class="form-group">
            <label for="pricingMode">{{ t('pricingMode') }}</label>
            <select id="pricingMode" v-model="pricingMode" :title="t('pricingMode')">
                <option value="tjm">{{ t('pricingModeTjm') }}</option>
                <option value="manual">{{ t('pricingModeManual') }}</option>
            </select>
        </div>

        <!-- TJM mode: hourly rate + duration -->
        <div v-if="!isIndividual && pricingMode === 'tjm'" class="row-group">
            <div class="form-group">
                <label for="tjm">{{ t('hourlyRate') }}</label>
                <input id="tjm" name="tjm" v-model="refsMap.tjm" type="number" min="0" step="0.01"
                    :title="t('hourlyRate')" :aria-label="t('hourlyRate')"
                    :placeholder="t('enterHourlyRate')" />
            </div>
            <div class="form-group">
                <label for="duration">{{ t('missionDuration') }}</label>
                <select id="duration" name="duration" v-model="displayDuration"
                    :title="t('missionDuration')"
                    :aria-label="t('missionDuration')">
                    <option v-for="opt in DURATION_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Quantity and unit price -->
        <div class="row-group">
            <div class="form-group">
                <label for="quantity">{{ t('quantity') }}</label>
                <input id="quantity" name="quantity" v-model="refsMap.quantity" type="number" min="1" step="1"
                    required :title="t('quantity')"
                    :aria-label="t('quantity')" />
            </div>
            <div class="form-group">
                <label for="unitPrice">{{ refsMap.quantity > 1 ? (t('totalAmount')) :
                    t('unitPrice') }}</label>
                <input id="unitPrice" name="unitPrice" v-model="refsMap.unitPrice" type="number" min="0" step="0.01"
                    required :readonly="!isIndividual && pricingMode === 'tjm'"
                    :class="{ 'input-readonly': !isIndividual && pricingMode === 'tjm' }"
                    :title="refsMap.quantity > 1 ? (t('totalAmount')) : t('unitPrice')"
                    :aria-label="refsMap.quantity > 1 ? (t('totalAmount')) : t('unitPrice')" />
            </div>
        </div>

        <!-- VAT checkbox -->
        <div class="form-group">
            <label for="tvaApplicable" :title="t('tvaApplicable')">
                <input id="tvaApplicable" name="tvaApplicable" type="checkbox" v-model="refsMap.tvaApplicable"
                    :aria-label="t('tvaApplicable')" />
                {{ t('tvaApplicable') }}
            </label>
        </div>
    </FormModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, reactive, ref, watch } from 'vue'
import { useMessage } from '@/composables/useMessage.js'
import { useMissions } from '@/composables/useMissions.js'
import { isProfessionalType } from '@/utils/clientTypes.js'
import { DURATION_OPTIONS } from '@/utils/durationOptions.js'
import FormModal from '@/components/ui/Modal/FormModal.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

// Composables for missions & messaging
const lang = useLang()
const { getTranslation: t } = lang
const { clients, services, isIndividualClient, displayServiceName, fetchFormData, createMission } = useMissions()
const { translatedMessage, showMessage, clearMessage } = useMessage()

const formLoading = ref(false)
const displayDuration = ref('7.00')

// 'tjm' = rate × duration → calculated price | 'manual' = price entered directly
const pricingMode = ref('tjm')

// Reactive form state
const refsMap = reactive({ clientId: '', serviceId: '', title: '', date: '', duration: 7, quantity: 1, unitPrice: 0, tvaApplicable: false, tjm: 30 })

// Resolves selected client type
const selectedClientType = computed(() => clients.value.find(c => c.id === refsMap.clientId)?.type)

// True only for individual (non-B2B)
const isIndividual = computed(() => isIndividualClient(refsMap.clientId))

// Services filtered by client type
const availableServices = computed(() =>
    isIndividual.value
        ? services.value.filter(s => !s.name.includes('Corporate'))
        : services.value.filter(s => s.name.includes('Corporate'))
)

// Recalculates unit price from TJM × duration × quantity (only in TJM mode)
const calculateUnitPrice = () => {
    if (pricingMode.value === 'tjm' && isProfessionalType(selectedClientType.value) && refsMap.tjm && refsMap.duration)
        refsMap.unitPrice = Math.round(refsMap.tjm * refsMap.duration * refsMap.quantity * 100) / 100
}

// Watchers for reactive price recalculation
watch(displayDuration, val => { refsMap.duration = parseFloat(val) || 7; calculateUnitPrice() })
watch(() => refsMap.quantity, calculateUnitPrice)
watch(() => refsMap.tjm, calculateUnitPrice)
watch(() => refsMap.duration, calculateUnitPrice)

// On mode switch: clear when going manual, reverse-calculate tjm when going TJM
watch(pricingMode, mode => {
    if (mode === 'manual') {
        refsMap.tjm = 0; refsMap.duration = 7; displayDuration.value = '7.00'; refsMap.unitPrice = 0
    } else {
        const dur = refsMap.duration || 7
        const qty = refsMap.quantity || 1
        const existingPrice = refsMap.unitPrice || 0
        // Infer tjm from current price — fallback to 30 if no price set yet
        refsMap.tjm = existingPrice > 0
            ? Math.round((existingPrice / (dur * qty)) * 100) / 100
            : 30
        calculateUnitPrice()
    }
})

// On switch to individual: reset pricing to TJM mode with clean state
watch(isIndividual, nowIndividual => {
    if (nowIndividual) { pricingMode.value = 'tjm'; refsMap.tjm = 0; refsMap.duration = 7; displayDuration.value = '7.00' }
})

// Initial form snapshot
let initialForm = {}
watch(() => props.show, async val => {
    if (val) {
        formLoading.value = true
        await fetchFormData()
        if (!refsMap.clientId && clients.value.length) refsMap.clientId = clients.value[0].id
        if (!refsMap.serviceId && services.value.length)
            refsMap.serviceId = isIndividual.value
                ? services.value.find(s => !s.name.includes('Corporate'))?.id || services.value[0]?.id || ''
                : services.value.find(s => s.name.includes('Corporate'))?.id || services.value[0]?.id || ''
        initialForm = { ...refsMap }
        displayDuration.value = '7.00'
        pricingMode.value = 'tjm'
        formLoading.value = false
    }
})

// Closes/resets form
const close = () => { Object.assign(refsMap, initialForm); displayDuration.value = '7'; pricingMode.value = 'tjm'; clearMessage(); formLoading.value = false; emit('close') }

// Saves the mission: tjm = 0 in manual mode, tjm = the rate in TJM mode
const handleSubmit = async () => {
    clearMessage(); formLoading.value = true
    const res = await createMission({
        ...refsMap,
        // manual mode → tjm = 0 explicitly, individual → tjm = null (not applicable)
        tjm: isIndividual.value ? null : (pricingMode.value === 'manual' ? 0 : refsMap.tjm)
    })
    formLoading.value = false
    if (!res.success) return showMessage('error', lang.getTranslation('errorSavingMission'), 0)

    showMessage('success', lang.getTranslation('missionAdded'), 1500)
    setTimeout(() => {
        Object.assign(refsMap, { clientId: '', serviceId: '', title: '', date: '', duration: 7, quantity: 1, unitPrice: 0, tvaApplicable: false, tjm: 30 })
        displayDuration.value = '7'
        pricingMode.value = 'tjm'
        close(); emit('saved')
    }, 1500)
}

// The service follows the chosen client
watch(() => refsMap.clientId, () => {
    if (services.value.length)
        refsMap.serviceId = isIndividual.value
            ? services.value.find(s => !s.name.includes('Corporate'))?.id || services.value[0]?.id || ''
            : services.value.find(s => s.name.includes('Corporate'))?.id || services.value[0]?.id || ''
})
</script>

<style scoped>
/* "VAT applicable" checkbox */
.form-group label[for="tvaApplicable"] {
    width: fit-content
}

/* Price computed from the daily rate: read only */
.input-readonly {
    opacity: 0.6;
    cursor: not-allowed
}
</style>
