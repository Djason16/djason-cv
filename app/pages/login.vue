<template>
    <OtherSectionLayout :pageTitleKey="'loginTitle'" :pageSubtitleKey="'loginSubtitle'" :sections="loginSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template #custom-content>
            <div class="login-form-wrapper">
                <SlideInFromRight>

                    <!-- Render dynamic form fields based on current step -->
                    <div v-for="f in currentFormFields" :key="f.id" class="form-group text-large">
                        <label :for="f.id">{{ $lang.getTranslation(f.labelKey) }}</label>
                        <div class="input-with-toggle text-normal">
                            <input :id="f.id" v-model="form[f.model]"
                                :type="f.id === 'password' ? (showPassword ? 'text' : 'password') : f.type"
                                :placeholder="$lang.getTranslation(f.placeholderKey)" :required="f.required"
                                :autocomplete="f.autocomplete" @keyup.enter="handleEnter()"
                                :aria-label="$lang.getTranslation(f.labelKey)"
                                :title="$lang.getTranslation(f.labelKey)" />
                            <!-- Toggle password visibility -->
                            <div v-if="f.id === 'password'" class="password-toggle"
                                @click="showPassword = !showPassword" tabindex="0" role="button"
                                aria-label="Toggle password visibility">
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </div>
                        </div>
                    </div>

                    <!-- Action buttons — visible set changes per step -->
                    <div class="login-buttons">
                        <template v-for="(btn, i) in loginButtons" :key="i">
                            <HeroButton v-if="btn.visible()" :label="$lang.getTranslation(btn.labelKey())"
                                :iconClass="btn.icon" :disabled="btn.disabled()" @click="btn.action" />
                        </template>
                    </div>
                </SlideInFromRight>

                <!-- Feedback messages -->
                <MessageBox :message="translatedMessage" />

                <!-- Hidden forms for enter key submission -->
                <form id="login-dummy-form" @submit.prevent="handleLogin" style="display:none;" />
                <form id="forgot-password-form" @submit.prevent="handleForgotPassword" style="display:none;" />
            </div>
        </template>
    </OtherSectionLayout>
</template>


<script setup>
import { useNuxtApp, useState } from '#app'
import { seoMetaData } from '@/utils/seo.js'
import { computed, onMounted, ref, watch } from 'vue'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useAuth } from '~/composables/useAuth'
import { useMessage } from '~/composables/useMessage'

// Language context
const { $lang } = useNuxtApp()
await $lang.loadGroup('auth')

const { login, verifyOtp, cancelOtp, forgotPassword, loading: authLoading } = useAuth()
const isDev = useState('isDev', () => process.env.NODE_ENV === 'development')
const { translatedMessage, showMessage, clearMessage } = useMessage()

// Reactive form state
const form = ref({ email: '', password: '', securityAnswer: '', otp: '' })
const showForgotPassword = ref(false)
const showPassword = ref(false)

// Granular loading states per step
const sendingOtp = ref(false)
const sendingPassword = ref(false)

// Local source of truth for OTP step — avoids flash caused by composable's internal otpPending transitions
const otpActive = ref(false)

// Handle login — checking credentials then triggering OTP flow
const handleLogin = async () => {
    clearMessage()
    sendingOtp.value = true
    const res = await login(form.value.email, form.value.password)
    sendingOtp.value = false
    if (res.otpRequired) {
        otpActive.value = true
        return showMessage('success', 'otpSent')
    }
    showMessage(res.success ? 'success' : 'error', res.success ? res.message : res.error)
}

// Handle OTP verification — success redirects so no need to update otpActive
const handleVerifyOtp = async () => {
    clearMessage()
    const res = await verifyOtp(form.value.otp)
    if (!res.success) showMessage('error', res.error)
}

// Toggle between login and forgot password form
const toggleForgotPassword = () => {
    showForgotPassword.value = !showForgotPassword.value
    clearMessage()
    form.value = { ...form.value, password: '', securityAnswer: '', otp: '' }
    showPassword.value = false
}

// Handle forgot password submission
const handleForgotPassword = async () => {
    clearMessage()
    sendingPassword.value = true
    const res = await forgotPassword(form.value.email, form.value.securityAnswer, $lang.current.value === 'french' ? 'fr' : 'en')
    sendingPassword.value = false
    showMessage(res.success ? 'success' : 'error', res.success ? res.message : res.error)
    if (res.success) setTimeout(toggleForgotPassword, 5000)
}

// Cancel OTP step and return to login
const backFromOtp = () => {
    otpActive.value = false
    cancelOtp()
    clearMessage()
}

// Buttons configuration — each step has its own visible set
const loginButtons = [
    { labelKey: () => sendingOtp.value ? 'checkingCredentials' : 'loginButton', icon: 'fas fa-sign-in-alt', visible: () => !showForgotPassword.value && !otpActive.value, disabled: () => authLoading.value, action: handleLogin },
    { labelKey: () => 'forgotPassword', icon: 'fas fa-key', visible: () => !showForgotPassword.value && !otpActive.value, disabled: () => authLoading.value, action: toggleForgotPassword },
    { labelKey: () => sendingPassword.value ? 'sendingPasswordLoading' : 'sendTempPassword', icon: 'fas fa-paper-plane', visible: () => showForgotPassword.value, disabled: () => authLoading.value, action: handleForgotPassword },
    { labelKey: () => 'backToLogin', icon: 'fas fa-arrow-left', visible: () => showForgotPassword.value, disabled: () => authLoading.value, action: toggleForgotPassword },
    { labelKey: () => authLoading.value ? 'verifying' : 'verifyOtp', icon: 'fas fa-shield-alt', visible: () => otpActive.value, disabled: () => authLoading.value, action: handleVerifyOtp },
    { labelKey: () => 'backToLogin', icon: 'fas fa-arrow-left', visible: () => otpActive.value, disabled: () => authLoading.value, action: backFromOtp }
]

// Form fields per step
const loginFormFields = [
    { id: 'email', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', required: true, autocomplete: 'email' },
    { id: 'password', type: 'password', model: 'password', labelKey: 'passwordLabel', placeholderKey: 'passwordPlaceholder', required: true, autocomplete: 'current-password' }
]
const forgotPasswordFormFields = [
    { id: 'email-forgot', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', required: true, autocomplete: 'email' },
    { id: 'security-answer', type: 'text', model: 'securityAnswer', labelKey: 'securityQuestion', placeholderKey: 'securityAnswerPlaceholder', required: true, autocomplete: 'off' }
]
const otpFormFields = [
    { id: 'otp', type: 'text', model: 'otp', labelKey: 'otpLabel', placeholderKey: 'otpPlaceholder', required: true, autocomplete: 'one-time-code' }
]

// Switch displayed fields based on current step
const currentFormFields = computed(() => {
    if (otpActive.value) return otpFormFields
    return showForgotPassword.value ? forgotPasswordFormFields : loginFormFields
})

// Switch enter key handler based on current step
const handleEnter = () => {
    if (otpActive.value) return handleVerifyOtp()
    if (showForgotPassword.value) return handleForgotPassword()
    return handleLogin()
}

const loginSections = computed(() =>
    Array.from({ length: 3 }, (_, i) => ({ titleKey: `loginSection${i + 1}Title`, contentKey: `loginSection${i + 1}Content` }))
)

// SEO metadata reactive to language
const pageKey = 'login'
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))

// Optional dev DB setup
onMounted(async () => {
    try {
        const res = await $fetch('/api/database/setup')
        if (isDev.value) console.log('[DEV] DB setup:', res)
    } catch (e) {
        if (isDev.value) console.error('[DEV] DB setup failed:', e)
    }
})

definePageMeta({ middleware: 'guest-server' })
</script>


<style scoped>
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

.login-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}
</style>