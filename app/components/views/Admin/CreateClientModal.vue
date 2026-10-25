<template>
    <!-- New client: fields depend on the client type -->
    <FormModal :show="show" :title="t('addClient')" :message="translatedMessage" :loading="formLoading"
        @close="close" @submit="handleSubmit">

        <!-- Dynamic grouped fields -->
        <div v-for="(group, i) in groupedFields" :key="i" class="row-group">
            <div v-for="f in group" :key="f.id" class="form-group">
                <label :for="f.id">{{ t(f.labelKey) }}</label>
                <input :id="f.id" v-model="refsMap[f.id]" :type="f.type"
                    :placeholder="t(f.placeholderKey)" :title="t(f.labelKey)"
                    :aria-label="t(f.labelKey)" :required="f.required"
                    :autocomplete="f.autocomplete" />
            </div>
        </div>

        <!-- Client type selector -->
        <div class="form-group">
            <label for="type">{{ t('clientType') }}</label>
            <select id="type" v-model="refsMap.type" required :title="t('clientType')"
                :aria-label="t('clientType')">
                <option v-for="opt in clientTypeOptions" :key="opt.value" :value="opt.value">
                    {{ t(opt.labelKey) }}
                </option>
            </select>
        </div>

        <!-- Active status selector -->
        <div class="form-group">
            <label for="active">{{ t('status') }}</label>
            <select id="active" v-model="refsMap.active" required :title="t('status')"
                :aria-label="t('status')">
                <option :value="true">{{ t('active') }}</option>
                <option :value="false">{{ t('inactive') }}</option>
            </select>
        </div>
    </FormModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, reactive, ref } from 'vue'
import { useClients } from '@/composables/useClients.js'
import { useMessage } from '@/composables/useMessage.js'
import { getClientTypeOptions } from '@/utils/clientTypes.js'
import FormModal from '@/components/ui/Modal/FormModal.vue'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

const lang = useLang()
const { getTranslation: t } = lang
const { getVisibleFields, groupFields, createClient } = useClients()
const { translatedMessage, showMessage, clearMessage } = useMessage()

const formLoading = ref(false)

// All available client type options for the select
const clientTypeOptions = getClientTypeOptions()

// Reactive form data
const refsMap = reactive({ firstname: '', lastname: '', company_name: '', email: '', phone: '', address: '', postal_code: '', city: '', siret: '', type: 'individual', active: true })

// Computes visible fields and group them by layout
const visibleFields = computed(() => getVisibleFields(refsMap.type))
const groupedFields = computed(() => groupFields(visibleFields.value))

// Resets form and closes modal
const close = () => {
    Object.keys(refsMap).forEach(k => {
        if (k === 'type') refsMap[k] = 'individual'
        else if (k === 'active') refsMap[k] = true
        else refsMap[k] = ''
    })
    clearMessage()
    formLoading.value = false
    emit('close')
}

// Submits form and shows feedback messages
const handleSubmit = async () => {
    clearMessage()
    formLoading.value = true
    const res = await createClient({ ...refsMap })
    formLoading.value = false
    if (!res.success) return showMessage('error', lang.getTranslation('errorSavingClient'), 0)

    showMessage('success', lang.getTranslation('clientAdded'), 1500)
    setTimeout(() => { close(); emit('saved') }, 1500)
}
</script>
