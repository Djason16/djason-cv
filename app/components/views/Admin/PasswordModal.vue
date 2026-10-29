<template>
    <!-- Change of the admin password -->
    <FormModal :show="show" :title="t('changePassword')" :message="translatedMessage" :loading="loading" max-height="80vh"
        @close="close" @submit="handleSubmit">

        <!-- Password fields with visibility toggle -->
        <div v-for="f in passwordFields" :key="f.id" class="form-group">
            <label :for="f.id">{{ t(f.labelKey) }}</label>
            <div class="input-with-toggle">
                <input :id="f.id" v-model="refsMap[f.id].value"
                    :type="showPasswordMap[f.id].value ? 'text' : 'password'"
                    :placeholder="t(f.placeholderKey)" :title="t(f.labelKey)"
                    :aria-label="t(f.labelKey)" :autocomplete="f.autocomplete" required />
                <div class="password-toggle" @click="showPasswordMap[f.id].value = !showPasswordMap[f.id].value"
                    tabindex="0" role="button"
                    :aria-label="showPasswordMap[f.id].value ? 'Hide password' : 'Show password'">
                    <i :class="showPasswordMap[f.id].value ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </div>
            </div>
        </div>
    </FormModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { ref } from 'vue'
import FormModal from '@/components/ui/Modal/FormModal.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useMessage } from '@/composables/useMessage.js'

const { getTranslation: t } = useLang()

const { updatePassword, loading } = useAuth()
const { translatedMessage, showMessage, clearMessage } = useMessage()

defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Value of each field, and whether it is shown in clear
const refsMap = { current: ref(''), new: ref(''), confirm: ref('') }
const showPasswordMap = { current: ref(false), new: ref(false), confirm: ref(false) }

// The three fields of the form
const passwordFields = [
    { id: 'current', labelKey: 'currentPassword', placeholderKey: 'currentPasswordPlaceholder', autocomplete: 'current-password' },
    { id: 'new', labelKey: 'newPassword', placeholderKey: 'newPasswordPlaceholder', autocomplete: 'new-password' },
    { id: 'confirm', labelKey: 'confirmPassword', placeholderKey: 'confirmPasswordPlaceholder', autocomplete: 'new-password' }
]

// Empties the form before closing, so the passwords do not stay in memory
const close = () => {
    Object.values(refsMap).forEach(r => r.value = '')
    Object.values(showPasswordMap).forEach(r => r.value = false)
    clearMessage(); loading.value = false; emit('close')
}

// Success: message, then the modal closes · Error: message stays until the next try
const handleSubmit = async () => {
    clearMessage()
    const result = await updatePassword(refsMap.current.value, refsMap.new.value, refsMap.confirm.value)
    result.success
        ? (showMessage('success', result.message, 1500), setTimeout(close, 1500))
        : showMessage('error', result.error, 0)
}
</script>

<style scoped>
/* Password field with the show / hide button inside it */
.input-with-toggle {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.input-with-toggle input {
    flex: 1;
    padding-right: 0;
}

.password-toggle {
    cursor: pointer;
    color: var(--text-color-light);
    display: flex;
    align-items: center;
    line-height: 1;
}
</style>
