<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('changePassword')" @close="close">
        <form ref="formRef" @submit.prevent="handleSubmit" class="password-form" :class="{ 'has-scroll': hasScroll }">
            <!-- Hidden input to help password managers detect username context -->
            <input type="text" name="username" autocomplete="username"
                style="position:absolute;opacity:0;height:0;width:0;border:none;padding:0;margin:0" tabindex="-1" />

            <!-- Password fields with visibility toggle -->
            <div v-for="f in passwordFields" :key="f.id" class="form-group">
                <label :for="f.id">{{ $lang.getTranslation(f.labelKey) }}</label>
                <div class="input-with-toggle">
                    <input :id="f.id" v-model="refsMap[f.id].value"
                        :type="showPasswordMap[f.id].value ? 'text' : 'password'"
                        :placeholder="$lang.getTranslation(f.placeholderKey)" :title="$lang.getTranslation(f.labelKey)"
                        :aria-label="$lang.getTranslation(f.labelKey)" :autocomplete="f.autocomplete" required />
                    <div class="password-toggle" @click="showPasswordMap[f.id].value = !showPasswordMap[f.id].value"
                        tabindex="0" role="button"
                        :aria-label="showPasswordMap[f.id].value ? 'Hide password' : 'Show password'">
                        <i :class="showPasswordMap[f.id].value ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </div>
                </div>
            </div>

            <MessageBox :message="translatedMessage" />

            <!-- Action buttons -->
            <div class="modal-footer">
                <HeroButton type="button" :label="$lang.getTranslation('cancel')" iconClass="fas fa-times"
                    @click="close" />
                <HeroButton type="submit"
                    :label="loading.value ? $lang.getTranslation('saving') : $lang.getTranslation('save')"
                    iconClass="fas fa-check" :disabled="loading.value" />
            </div>
        </form>
    </ModalDialog>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useNuxtApp } from '#app'
import ModalDialog from '../ModalDialog.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import { useAuth } from '~/composables/useAuth'
import { useMessage } from '~/composables/useMessage'

const { $lang } = useNuxtApp()
const { updatePassword, loading } = useAuth()
const { translatedMessage, showMessage, clearMessage } = useMessage()

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

// Field state and visibility toggles
const refsMap = { current: ref(''), new: ref(''), confirm: ref('') }
const showPasswordMap = { current: ref(false), new: ref(false), confirm: ref(false) }

// Password field configuration
const passwordFields = [
    { id: 'current', labelKey: 'currentPassword', placeholderKey: 'currentPasswordPlaceholder', autocomplete: 'current-password' },
    { id: 'new', labelKey: 'newPassword', placeholderKey: 'newPasswordPlaceholder', autocomplete: 'new-password' },
    { id: 'confirm', labelKey: 'confirmPassword', placeholderKey: 'confirmPasswordPlaceholder', autocomplete: 'new-password' }
]

// --- Scroll detection logic (adds padding if scrollable)
const formRef = ref(null)
const hasScroll = ref(false)
const checkScroll = () => formRef.value && (hasScroll.value = formRef.value.scrollHeight > formRef.value.clientHeight)
onMounted(() => { checkScroll(); window.addEventListener('resize', checkScroll) })
onBeforeUnmount(() => window.removeEventListener('resize', checkScroll))
watch(() => props.show, () => setTimeout(checkScroll, 100))

// --- Modal logic
const close = () => {
    Object.values(refsMap).forEach(r => r.value = '')
    Object.values(showPasswordMap).forEach(r => r.value = false)
    clearMessage(); loading.value = false; emit('close')
}

// --- Submit handler
const handleSubmit = async () => {
    clearMessage()
    const result = await updatePassword(refsMap.current.value, refsMap.new.value, refsMap.confirm.value)
    result.success
        ? (showMessage('success', result.message, 1500), setTimeout(close, 1500))
        : showMessage('error', result.error, 0)
}
</script>

<style scoped>
.password-form,
.form-group,
.modal-footer {
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
}

.password-form {
    gap: 2rem;
    min-width: 25vw;
    overflow-y: auto;
    max-height: 80vh;
    box-sizing: border-box;
    padding: 0;
}

.password-form.has-scroll {
    padding-right: 1rem;
}

.form-group {
    gap: 0.5rem;
}

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

.modal-footer {
    gap: 1rem;
}

::v-deep(.message-box p) {
    margin: 0;
}

@media(max-width:1024px) {
    .password-form {
        width: 100%;
        min-width: auto;
        max-width: 90vw;
    }
}
</style>