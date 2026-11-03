<template>
    <!-- Change of the admin password -->
    <FormModal :show="show" :title="t('changePassword')" :message="translatedMessage" :loading="loading" max-height="80vh"
        @close="close" @submit="handleSubmit">

        <!-- Password fields, each with its show / hide button (FormInput) -->
        <div v-for="f in passwordFields" :key="f.id" class="form-group">
            <label :for="f.id">{{ t(f.labelKey) }}</label>
            <FormInput ref="inputs" :id="f.id" v-model="refsMap[f.id].value" type="password"
                :placeholder="t(f.placeholderKey)" :title="t(f.labelKey)" :aria-label="t(f.labelKey)"
                :autocomplete="f.autocomplete" required />
        </div>
    </FormModal>
</template>

<script setup>
import { MESSAGE_DELAY, afterMessage } from '@/utils/feedback.js'
import { useLang } from '@/composables/useLang.js'
import { ref } from 'vue'
import FormModal from '@/components/ui/Modal/FormModal.vue'
import FormInput from '@/components/ui/Form/FormInput.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useMessage } from '@/composables/useMessage.js'

const { getTranslation: t } = useLang()

const { updatePassword, loading } = useAuth()
const { translatedMessage, showMessage, clearMessage } = useMessage()

defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Value of each field; the fields themselves, to hide the passwords again when the modal closes
const refsMap = { current: ref(''), new: ref(''), confirm: ref('') }
const inputs = ref([])

// The three fields of the form
const passwordFields = [
    { id: 'current', labelKey: 'currentPassword', placeholderKey: 'currentPasswordPlaceholder', autocomplete: 'current-password' },
    { id: 'new', labelKey: 'newPassword', placeholderKey: 'newPasswordPlaceholder', autocomplete: 'new-password' },
    { id: 'confirm', labelKey: 'confirmPassword', placeholderKey: 'confirmPasswordPlaceholder', autocomplete: 'new-password' }
]

// Empties the form before closing, so the passwords do not stay in memory
const close = () => {
    Object.values(refsMap).forEach(r => r.value = '')
    inputs.value.forEach(input => input?.hide())
    clearMessage(); loading.value = false; emit('close')
}

// Success: message, then the modal closes · Error: message stays until the next try
const handleSubmit = async () => {
    clearMessage()
    const result = await updatePassword(refsMap.current.value, refsMap.new.value, refsMap.confirm.value)
    if (!result.success) return showMessage('error', result.error, 0)
    showMessage('success', result.message, MESSAGE_DELAY)
    await afterMessage()
    close()
}
</script>
