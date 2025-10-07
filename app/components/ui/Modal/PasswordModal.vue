<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('changePassword')" @close="close">
        <form @submit.prevent="handleSubmit" class="password-form">
            <!-- Invisible input for password managers -->
            <input type="text" name="username" autocomplete="username"
                style="position:absolute;opacity:0;height:0;width:0;border:none;padding:0;margin:0" tabindex="-1" />

            <!-- Dynamically render password fields -->
            <div v-for="f in passwordFields" :key="f.id" class="form-group">
                <label :for="f.id">{{ $lang.getTranslation(f.labelKey) }}</label>
                <input :id="f.id" v-model="refsMap[f.id].value" type="password"
                    :placeholder="$lang.getTranslation(f.placeholderKey)" :title="$lang.getTranslation(f.labelKey)"
                    :aria-label="$lang.getTranslation(f.labelKey)" :autocomplete="f.autocomplete" required />
            </div>

            <!-- Display translated message dynamically -->
            <MessageBox :message="translatedMessage" />

            <!-- Footer buttons -->
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
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import ModalDialog from './ModalDialog.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import { useTranslatedMessage } from '~/composables/useTranslatedMessage'

const { $lang } = useNuxtApp()
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Reactive refs for each password field
const refsMap = { current: ref(''), new: ref(''), confirm: ref('') }
const loading = ref(false)
const message = ref(null) // raw key to translate

// Field configuration with translation keys
const passwordFields = [
    { id: 'current', labelKey: 'currentPassword', placeholderKey: 'currentPasswordPlaceholder', autocomplete: 'current-password' },
    { id: 'new', labelKey: 'newPassword', placeholderKey: 'newPasswordPlaceholder', autocomplete: 'new-password' },
    { id: 'confirm', labelKey: 'confirmPassword', placeholderKey: 'confirmPasswordPlaceholder', autocomplete: 'new-password' }
]

// Computed reactive translation for current message
const { translatedMessage } = useTranslatedMessage(message)

// Close modal & reset state
const close = () => {
    Object.values(refsMap).forEach(r => r.value = '')
    message.value = null
    loading.value = false
    emit('close')
}

// Handle password update submission
const handleSubmit = async () => {
    message.value = null

    // Quick client-side validation
    if (refsMap.new.value !== refsMap.confirm.value) {
        message.value = { type: 'error', key: 'passwordsDoNotMatch' }
        return
    }

    try {
        loading.value = true
        const res = await $fetch('/api/auth/update-password', {
            method: 'POST',
            body: { oldPassword: refsMap.current.value, newPassword: refsMap.new.value }
        })

        // Handle backend response
        message.value = res.success
            ? { type: 'success', key: 'passwordUpdated' }
            : { type: 'error', key: res.message }

        if (res.success) setTimeout(close, 1500)
    } catch (err) {
        message.value = { type: 'error', key: err.data?.message || 'passwordUpdateError' }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.password-form {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-width: 25vw;
    transition: all 0.3s ease;
    will-change: transform, opacity
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    transition: all 0.3s ease;
    will-change: transform, opacity
}

.modal-footer {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    transition: all 0.3s ease;
    will-change: transform, opacity
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