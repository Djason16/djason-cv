<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('changePassword')" @close="close">
        <form @submit.prevent="handleSubmit" class="password-form">
            <!-- Hidden field for password managers -->
            <input type="text" name="username" autocomplete="username"
                style="position:absolute;opacity:0;height:0;width:0;border:none;padding:0;margin:0" tabindex="-1" />

            <!-- Password fields -->
            <div v-for="f in passwordFields" :key="f.id" class="form-group">
                <label :for="f.id">{{ $lang.getTranslation(f.labelKey) }}</label>
                <input :id="f.id" v-model="refsMap[f.id].value" type="password"
                    :placeholder="$lang.getTranslation(f.placeholderKey)" :title="$lang.getTranslation(f.labelKey)"
                    :aria-label="$lang.getTranslation(f.labelKey)" :autocomplete="f.autocomplete" required />
            </div>

            <!-- Feedback message -->
            <MessageBox :message="translatedMessage" />

            <!-- Actions -->
            <div class="modal-footer">
                <HeroButton type="button" :label="$lang.getTranslation('cancel')" iconClass="fas fa-times"
                    @click="close" />
                <HeroButton type="submit"
                    :label="loading ? $lang.getTranslation('saving') : $lang.getTranslation('save')"
                    iconClass="fas fa-check" :disabled="loading" />
            </div>
        </form>
    </ModalDialog>
</template>

<script setup>
import { useNuxtApp } from '#app'
import { ref } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import { useAuth } from '~/composables/useAuth'
import { useTranslatedMessage } from '~/composables/useTranslatedMessage'
import ModalDialog from '../ModalDialog.vue'

const { $lang } = useNuxtApp()
const { updatePassword, loading } = useAuth()

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const refsMap = { current: ref(''), new: ref(''), confirm: ref('') }
const message = ref(null)

const passwordFields = [
    { id: 'current', labelKey: 'currentPassword', placeholderKey: 'currentPasswordPlaceholder', autocomplete: 'current-password' },
    { id: 'new', labelKey: 'newPassword', placeholderKey: 'newPasswordPlaceholder', autocomplete: 'new-password' },
    { id: 'confirm', labelKey: 'confirmPassword', placeholderKey: 'confirmPasswordPlaceholder', autocomplete: 'new-password' }
]

const { translatedMessage } = useTranslatedMessage(message)

// Reset modal state and close
const close = () => {
    Object.values(refsMap).forEach(r => r.value = '')
    Object.assign(message, { value: null })
    loading.value = false
    emit('close')
}

// Submit handler with validation and async request
const handleSubmit = async () => {
    message.value = null
    const result = await updatePassword(
        refsMap.current.value,
        refsMap.new.value,
        refsMap.confirm.value
    )
    message.value = result.success ? result.message : result.error
    if (result.success) setTimeout(close, 1500)
}
</script>

<style scoped>
.password-form,
.form-group,
.modal-footer {
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    will-change: transform, opacity
}

.password-form {
    gap: 2rem;
    min-width: 25vw;
}

.form-group {
    gap: 0.5rem;
}

.modal-footer {
    gap: 1rem;
}

::v-deep(.message-box p) {
    margin: 0
}

@media(max-width:1024px) {
    .password-form {
        width: 100%;
        min-width: 70vw
    }
}
</style>