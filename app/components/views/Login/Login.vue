<template>
    <!-- Admin login in three steps: email + password, then the code received by email; or a forgotten password -->
    <OtherSectionLayout pageTitleKey="loginTitle" pageSubtitleKey="loginSubtitle" :sections="loginSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template #custom-content>
            <div class="login-form-wrapper">
                <SlideInFromRight>
                    <!-- Fields of the current step (Enter submits it) -->
                    <div v-for="f in current.fields" :key="f.id" class="form-group text-large">
                        <label :for="f.id">{{ t(f.labelKey) }}</label>
                        <div class="input-with-toggle text-normal">
                            <input :id="f.id" v-model="form[f.model]"
                                :type="f.type === 'password' && showPassword ? 'text' : f.type"
                                :placeholder="t(f.placeholderKey)" required
                                :autocomplete="f.autocomplete" :aria-label="t(f.labelKey)"
                                :title="t(f.labelKey)" @keyup.enter="current.submit" />
                            <div v-if="f.type === 'password'" class="password-toggle" tabindex="0" role="button"
                                aria-label="Toggle password visibility" @click="showPassword = !showPassword">
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Main action of the step, then the way to another step -->
                    <div class="login-buttons">
                        <HeroButton :label="t(loading ? current.busyKey : current.submitKey)"
                            :iconClass="current.submitIcon" :disabled="loading" @click="current.submit" />
                        <HeroButton :label="t(current.otherKey)" :iconClass="current.otherIcon"
                            :disabled="loading" @click="current.other" />
                    </div>
                </SlideInFromRight>

                <MessageBox :message="translatedMessage" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { computed, ref } from 'vue'
import SlideInFromRight from '@/components/ui/Animation/SlideInFromRight.vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useAuth } from '@/composables/useAuth.js'
import { useLang } from '@/composables/useLang.js'
import { useMessage } from '@/composables/useMessage.js'

const lang = useLang()
const { getTranslation: t } = lang
const { login, verifyOtp, cancelOtp, forgotPassword, loading } = useAuth()
const { translatedMessage, showMessage, clearMessage } = useMessage()

// 'login' (email + password), 'otp' (code sent by email) or 'forgot' (security answer)
const step = ref('login')
const form = ref({ email: '', password: '', securityAnswer: '', otp: '' })
const showPassword = ref(false)

// Changes step, keeping only the email
const goTo = next => {
    step.value = next
    form.value = { ...form.value, password: '', securityAnswer: '', otp: '' }
    showPassword.value = false
    clearMessage()
}

// Shows the result of an API call: its translated message or its error key
const show = res => showMessage(res.success ? 'success' : 'error', res.success ? res.message : res.error)

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
    if (!res.success) show(res)
}

// Forgotten password: a temporary password is sent when the security answer is right, then back to the login
const submitForgot = async () => {
    clearMessage()
    const res = await forgotPassword(form.value.email, form.value.securityAnswer, lang.current.value)
    show(res)
    if (res.success) setTimeout(() => goTo('login'), 5000)
}

const emailField = { id: 'email', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'loginEnterEmail', autocomplete: 'email' }

// Fields and buttons of each step (texts in plugins/translations/pages/login.js)
const STEPS = {
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

.form-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 2rem;
    position: relative;
}

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

/* Submit and "other action" buttons */
.login-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>
