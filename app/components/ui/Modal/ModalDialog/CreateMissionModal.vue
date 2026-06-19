<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('addMission')" @close="close">
        <form ref="formRef" @submit.prevent="handleSubmit" :class="['mission-form', { 'has-scroll': hasScroll }]">
            <!-- Hidden dummy input to prevent autofill -->
            <input type="text" name="dummy" autocomplete="username"
                style="position:absolute;opacity:0;width:0;height:0;border:none;margin:0;padding:0" tabindex="-1" />

            <!-- Client selector -->
            <div class="form-group">
                <label for="client">{{ $lang.getTranslation('client') }}</label>
                <select id="client" name="client" v-model="refsMap.clientId" required
                    :title="$lang.getTranslation('client')" :aria-label="$lang.getTranslation('client')">
                    <option v-for="c in clients" :key="c.id" :value="c.id">
                        {{ c.company_name || [c.firstname, c.lastname].filter(Boolean).join(' ') || '-' }}
                    </option>
                </select>
            </div>

            <!-- Conditional service or title input -->
            <div class="row-group">
                <div v-if="isIndividual" class="form-group">
                    <label for="service">{{ $lang.getTranslation('selectService') }}</label>
                    <select id="service" name="service" v-model="refsMap.serviceId" required
                        :title="$lang.getTranslation('selectService')"
                        :aria-label="$lang.getTranslation('selectService')">
                        <option v-for="s in availableServices" :key="s.id" :value="s.id">{{ displayServiceName(s) }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="title">{{ $lang.getTranslation('missionTitle') }}</label>
                    <input id="title" name="title" v-model="refsMap.title" type="text"
                        :placeholder="$lang.getTranslation('enterMissionTitle')" required
                        :title="$lang.getTranslation('missionTitle')"
                        :aria-label="$lang.getTranslation('missionTitle')" />
                </div>
            </div>

            <!-- Date -->
            <div class="form-group">
                <label for="date">{{ $lang.getTranslation('missionDate') }}</label>
                <input id="date" name="date" v-model="refsMap.date" type="date" required
                    :title="$lang.getTranslation('missionDate')" :aria-label="$lang.getTranslation('missionDate')" />
            </div>

            <!-- Pricing mode toggle — only for professional clients -->
            <div v-if="!isIndividual" class="form-group">
                <label for="pricingMode">{{ $lang.getTranslation('pricingMode') || 'Mode de tarification' }}</label>
                <select id="pricingMode" v-model="pricingMode" :title="$lang.getTranslation('pricingMode')">
                    <option value="tjm">{{ $lang.getTranslation('pricingModeTjm') || 'Taux horaire × durée' }}</option>
                    <option value="manual">{{ $lang.getTranslation('pricingModeManual') || 'Prix direct' }}</option>
                </select>
            </div>

            <!-- TJM mode: hourly rate + duration -->
            <div v-if="!isIndividual && pricingMode === 'tjm'" class="row-group">
                <div class="form-group">
                    <label for="tjm">{{ $lang.getTranslation('hourlyRate') || 'Taux horaire (€/h)' }}</label>
                    <input id="tjm" name="tjm" v-model="refsMap.tjm" type="number" min="0" step="0.01"
                        :title="$lang.getTranslation('hourlyRate')" :aria-label="$lang.getTranslation('hourlyRate')"
                        :placeholder="$lang.getTranslation('enterHourlyRate') || 'Ex: 30'" />
                </div>
                <div class="form-group">
                    <label for="duration">{{ $lang.getTranslation('missionDuration') }}</label>
                    <select id="duration" name="duration" v-model="displayDuration"
                        :title="$lang.getTranslation('missionDuration')"
                        :aria-label="$lang.getTranslation('missionDuration')">
                        <option v-for="opt in durationOptions" :key="opt.value" :value="opt.value">{{ opt.label }}
                        </option>
                    </select>
                </div>
            </div>

            <!-- Quantity and unit price -->
            <div class="row-group">
                <div class="form-group">
                    <label for="quantity">{{ $lang.getTranslation('quantity') }}</label>
                    <input id="quantity" name="quantity" v-model="refsMap.quantity" type="number" min="1" step="1"
                        required :title="$lang.getTranslation('quantity')"
                        :aria-label="$lang.getTranslation('quantity')" />
                </div>
                <div class="form-group">
                    <label for="unitPrice">{{ refsMap.quantity > 1 ? ($lang.getTranslation('totalAmount') || 'Total') :
                        $lang.getTranslation('unitPrice') }}</label>
                    <input id="unitPrice" name="unitPrice" v-model="refsMap.unitPrice" type="number" min="0" step="0.01"
                        required :readonly="!isIndividual && pricingMode === 'tjm'"
                        :class="{ 'input-readonly': !isIndividual && pricingMode === 'tjm' }"
                        :title="refsMap.quantity > 1 ? ($lang.getTranslation('totalAmount') || 'Total') : $lang.getTranslation('unitPrice')"
                        :aria-label="refsMap.quantity > 1 ? ($lang.getTranslation('totalAmount') || 'Total') : $lang.getTranslation('unitPrice')" />
                </div>
            </div>

            <!-- VAT checkbox -->
            <div class="form-group">
                <label for="tvaApplicable" :title="$lang.getTranslation('tvaApplicable')">
                    <input id="tvaApplicable" name="tvaApplicable" type="checkbox" v-model="refsMap.tvaApplicable"
                        :aria-label="$lang.getTranslation('tvaApplicable')" />
                    {{ $lang.getTranslation('tvaApplicable') }}
                </label>
            </div>

            <MessageBox :message="translatedMessage" />

            <!-- Footer buttons -->
            <div class="modal-footer">
                <HeroButton type="button" :label="$lang.getTranslation('cancel')" iconClass="fas fa-times"
                    @click="close" />
                <HeroButton type="submit"
                    :label="formLoading ? $lang.getTranslation('saving') : $lang.getTranslation('save')"
                    iconClass="fas fa-check" :disabled="formLoading" />
            </div>
        </form>
    </ModalDialog>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import { useMessage } from '~/composables/useMessage'
import { useMissions } from '~/composables/useMissions'
import { isProfessionalType } from '~/utils/clientTypes'
import { getDurationOptions } from '~/utils/durationOptions'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

// Composables for missions & messaging
const { $lang, clients, services, isIndividualClient, displayServiceName, fetchData } = useMissions()
const { translatedMessage, showMessage, clearMessage } = useMessage()

const formLoading = ref(false)
const formRef = ref(null)
const hasScroll = ref(false)
const displayDuration = ref('7.00')

// 'tjm' = rate × duration → calculated price | 'manual' = price entered directly
const pricingMode = ref('tjm')

// Reactive form state
const refsMap = reactive({ clientId: '', serviceId: '', title: '', date: '', duration: 7, quantity: 1, unitPrice: 0, tvaApplicable: false, tjm: 30 })

// Duration options
const durationOptions = computed(() => getDurationOptions())

// Resolve selected client type
const selectedClientType = computed(() => clients.value.find(c => c.id === refsMap.clientId)?.type)

// True only for individual (non-B2B)
const isIndividual = computed(() => isIndividualClient(refsMap.clientId))

// Services filtered by client type
const availableServices = computed(() =>
    isIndividual.value
        ? services.value.filter(s => !s.name.includes('Corporate'))
        : services.value.filter(s => s.name.includes('Corporate'))
)

// Recalculate unit price from TJM × duration × quantity (only in TJM mode)
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
        await fetchData()
        if (!refsMap.clientId && clients.value.length) refsMap.clientId = clients.value[0].id
        if (!refsMap.serviceId && services.value.length)
            refsMap.serviceId = isIndividual.value
                ? services.value.find(s => !s.name.includes('Corporate'))?.id || services.value[0]?.id || ''
                : services.value.find(s => s.name.includes('Corporate'))?.id || services.value[0]?.id || ''
        initialForm = { ...refsMap }
        displayDuration.value = '7.00'
        pricingMode.value = 'tjm'
        setTimeout(checkScroll, 100)
        formLoading.value = false
    }
})

// Close/reset form
const close = () => { Object.assign(refsMap, initialForm); displayDuration.value = '7'; pricingMode.value = 'tjm'; clearMessage(); formLoading.value = false; emit('close') }

// Submit handler — send tjm = 0 for manual mode, tjm = value for TJM mode
const handleSubmit = async () => {
    clearMessage(); formLoading.value = true
    try {
        const body = {
            ...refsMap,
            // manual mode → tjm = 0 explicitly, individual → tjm = null (not applicable)
            tjm: isIndividual.value ? null : (pricingMode.value === 'manual' ? 0 : refsMap.tjm)
        }
        await $fetch('/api/missions/create-mission', { method: 'POST', body })
        showMessage('success', $lang.getTranslation('missionAdded'), 1500)
        setTimeout(() => {
            Object.assign(refsMap, { clientId: '', serviceId: '', title: '', date: '', duration: 7, quantity: 1, unitPrice: 0, tvaApplicable: false, tjm: 30 })
            displayDuration.value = '7'
            pricingMode.value = 'tjm'
            close(); emit('saved')
        }, 1500)
    } catch (err) { showMessage('error', err.message || $lang.getTranslation('errorSavingMission'), 0) }
    finally { formLoading.value = false }
}

// Scroll detection for form overflow
const checkScroll = () => formRef.value && (hasScroll.value = formRef.value.scrollHeight > formRef.value.clientHeight)
let observer
onMounted(() => { checkScroll(); window.addEventListener('resize', checkScroll); observer = new MutationObserver(() => setTimeout(checkScroll, 50)); formRef.value && observer.observe(formRef.value, { childList: true, subtree: true, characterData: true }) })
onBeforeUnmount(() => { observer?.disconnect(); window.removeEventListener('resize', checkScroll) })

// Auto-set service on client change
watch(() => refsMap.clientId, () => {
    if (services.value.length)
        refsMap.serviceId = isIndividual.value
            ? services.value.find(s => !s.name.includes('Corporate'))?.id || services.value[0]?.id || ''
            : services.value.find(s => s.name.includes('Corporate'))?.id || services.value[0]?.id || ''
})
</script>

<style scoped>
.mission-form,
.form-group,
.modal-footer {
    display: flex;
    flex-direction: column;
    transition: all .3s ease
}

.mission-form {
    gap: 2rem;
    min-width: 25vw;
    max-width: 90vw;
    max-height: 60vh;
    overflow-y: auto;
    padding: 0;
    box-sizing: border-box
}

.mission-form.has-scroll {
    padding-right: 1rem
}

.row-group {
    display: flex;
    flex-direction: column;
    gap: 1rem
}

.row-group .form-group {
    flex: 1
}

.form-group {
    gap: .5rem
}

.form-group label[for="tvaApplicable"] {
    width: fit-content
}

.modal-footer {
    gap: 1rem;
    margin-top: auto
}

.input-readonly {
    opacity: 0.6;
    cursor: not-allowed
}

::v-deep(.message-box p) {
    margin: 0
}

@media(min-width:1025px) {
    .row-group {
        flex-direction: row
    }
}

@media(max-width:1024px) {
    .mission-form {
        width: 100%;
        min-width: auto;
        max-width: 90vw
    }
}
</style>