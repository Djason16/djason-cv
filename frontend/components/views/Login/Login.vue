<!-- Admin login in three steps: email + password, then the code received by email; or a forgotten password -->
<template>
    <OtherSectionLayout pageTitleKey="loginTitle" pageSubtitleKey="loginSubtitle" :sections="loginSections">
        <template #custom-content>
            <div v-reveal class="login-form-wrapper">
                <!-- Each step of the login: the form changes with a fade and a short rise -->
                <Transition name="swap" mode="out-in">
                    <div :key="step">
                        <!-- Fields of the current step (Enter submits it) -->
                        <div v-for="f in current.fields" :key="f.id" class="form-group text-label">
                            <label :for="f.id">{{ t(f.labelKey) }}</label>
                            <FormInput :id="f.id" v-model="form[f.model]" :type="f.type"
                                :placeholder="t(f.placeholderKey)" required :autocomplete="f.autocomplete"
                                :aria-label="t(f.labelKey)" :title="t(f.labelKey)" @enter="current.submit" />
                        </div>

                        <!-- Main action of the step, then the way to another step -->
                        <div class="login-buttons">
                            <HeroButton :label="t(loading ? current.busyKey : current.submitKey)"
                                primary :iconClass="current.submitIcon" :disabled="loading" @click="current.submit" />
                            <HeroButton :label="t(current.otherKey)" :iconClass="current.otherIcon"
                                :disabled="loading" @click="current.other" />
                        </div>
                    </div>
                </Transition>

                <MessageBox :message="translatedMessage" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup lang="ts">
import type { ApiResult } from '@/utils/api'
import { goToPage } from '@/composables/useAuth'
import { afterMessage } from '@/utils/feedback'
import { computed, ref } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import FormInput from '@/components/ui/Form/FormInput.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useAuth } from '@/composables/useAuth'
import { useLang } from '@/composables/useLang'
import { useMessage } from '@/composables/useMessage'

const lang = useLang()
const { getTranslation: t } = lang
const { login, verifyOtp, cancelOtp, forgotPassword, loading } = useAuth()
const { translatedMessage, showMessage, clearMessage } = useMessage()

// 'login' (email + password), 'otp' (code sent by email) or 'forgot' (security answer)
const step = ref('login')
const form = ref<{ email: string, password: string, securityAnswer: string, otp: string, [model: string]: string }>({ email: '', password: '', securityAnswer: '', otp: '' })

// Changes step, keeping only the email (and the message, when it still has to be read)
const goTo = (next: string, keepMessage = false) => {
    step.value = next
    form.value = { ...form.value, password: '', securityAnswer: '', otp: '' }
    if (!keepMessage) clearMessage()
}

// Shows the result of an API call: its translated message or its error key
const show = (res: ApiResult) => showMessage(res.success ? 'success' : 'error', res.success ? res.message : res.error ?? '')

// Step 1: email + password, then a code is sent by email
const submitLogin = async () => {
    clearMessage()
    const res = await login(form.value.email, form.value.password)
    if (!res.otpRequired) return show(res)
    step.value = 'otp'
    showMessage('success', 'otpSent')
}

// Step 2: the code received by email. On success useAuth redirects to /admin/
const submitOtp = async () => {
    clearMessage()
    const res = await verifyOtp(form.value.otp)
    show(res)
    if (!res.success) return
    // Read first, then the admin page
    await afterMessage()
    goToPage('/admin')
}

// Forgotten password: a temporary password is sent when the security answer is right, then back to the login
const submitForgot = async () => {
    clearMessage()
    const res = await forgotPassword(form.value.email, form.value.securityAnswer, lang.current.value)
    show(res)
    if (!res.success) return
    await afterMessage()
    goTo('login', true)
}

const emailField = { id: 'email', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'loginEnterEmail', autocomplete: 'email' }

// Fields and buttons of each step (texts in plugins/translations/pages/login.js)
const STEPS: Record<string, any> = {
    login: {
        fields: [emailField, { id: 'password', type: 'password', model: 'password', labelKey: 'passwordLabel', placeholderKey: 'passwordPlaceholder', autocomplete: 'current-password' }],
        submitKey: 'loginButton', busyKey: 'checkingCredentials', submitIcon: 'fas fa-sign-in-alt', submit: submitLogin,
        otherKey: 'forgotPassword', otherIcon: 'fas fa-key', other: () => goTo('forgot'),
    },
    otp: {
        fields: [{ id: 'otp', type: 'text', model: 'otp', labelKey: 'otpLabel', placeholderKey: 'otpPlaceholder', autocomplete: 'one-time-code' }],
        submitKey: 'verifyOtp', busyKey: 'verifying', submitIcon: 'fas fa-shield-alt', submit: submitOtp,
        otherKey: 'backToLogin', otherIcon: 'fas fa-arrow-left', other: () => { cancelOtp(); goTo('login') },
    },
    forgot: {
        fields: [{ ...emailField, id: 'email-forgot' }, { id: 'security-answer', type: 'text', model: 'securityAnswer', labelKey: 'securityQuestion', placeholderKey: 'securityAnswerPlaceholder', autocomplete: 'off' }],
        submitKey: 'sendTempPassword', busyKey: 'sendingPasswordLoading', submitIcon: 'fas fa-paper-plane', submit: submitForgot,
        otherKey: 'backToLogin', otherIcon: 'fas fa-arrow-left', other: () => goTo('login'),
    },
}
const current = computed(() => STEPS[step.value])

// Text sections of the page (loginSection1Title... in plugins/translations/pages/login.js)
const loginSections = Array.from({ length: 3 }, (_, i) => ({ titleKey: `loginSection${i + 1}Title`, contentKey: `loginSection${i + 1}Content` }))
</script>

<style scoped>
/* Form of the current step */
.login-form-wrapper {
    text-align: left;
    margin-top: 2rem;
}

/* Label above its field (FormInput), like the forms of the admin */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 480px;
    margin-bottom: 1.5rem;
}

/* Submit and "other action" buttons */
.login-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
