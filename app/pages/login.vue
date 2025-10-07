<template>
    <OtherSectionLayout pageTitleKey="loginTitle" pageSubtitleKey="loginSubtitle" :sections="loginSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template v-slot:custom-content>
            <div class="login-form-wrapper">
                <SlideInFromRight>
                    <!-- Dynamically render form inputs -->
                    <div v-for="f in formFields" :key="f.id" class="form-group text-large">
                        <label :for="f.id">{{ $lang.getTranslation(f.labelKey) }}</label>
                        <input :id="f.id" v-model="form[f.model]" :type="f.type"
                            :placeholder="$lang.getTranslation(f.placeholderKey)" :required="f.required"
                            :autocomplete="f.autocomplete" form="login-dummy-form" @keyup.enter="handleLogin"
                            :aria-label="$lang.getTranslation(f.labelKey)" :title="$lang.getTranslation(f.labelKey)" />
                    </div>

                    <!-- Login button with dynamic label for loading state -->
                    <HeroButton :label="$lang.getTranslation(authLoading ? 'loggingIn' : 'loginButton')"
                        iconClass="fas fa-sign-in-alt" :disabled="authLoading" @click="handleLogin"
                        :ariaLabel="$lang.getTranslation(authLoading ? 'loggingIn' : 'loginButton')"
                        :title="$lang.getTranslation(authLoading ? 'loggingIn' : 'loginButton')" />
                </SlideInFromRight>

                <!-- Show dynamic, translated feedback -->
                <MessageBox :message="translatedMessage" />

                <!-- Hidden form for native browser submission -->
                <form id="login-dummy-form" @submit.prevent="handleLogin" style="display:none;" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useNuxtApp, useState } from '#app'
import OtherSectionLayout from '~/components/ui/SectionLayout/OtherSectionLayout.vue'
import SlideInFromRight from '~/components/animations/SlideInFromRight.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import { useTranslatedMessage } from '~/composables/useTranslatedMessage'
import { seoMetaData } from '@/utils/seo.js'

const { $lang } = useNuxtApp()
const { login, loading: authLoading, error: authError } = useAuth()

// Reactive states
const isDev = useState('isDev', () => process.env.NODE_ENV === 'development')
const form = ref({ email: '', password: '' })
const errorMessage = ref(null)
watch(authError, e => e && (errorMessage.value = e))

// Configure form fields with translation keys
const formFields = [
    { id: 'email', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', required: true, autocomplete: 'email' },
    { id: 'password', type: 'password', model: 'password', labelKey: 'passwordLabel', placeholderKey: 'passwordPlaceholder', required: true, autocomplete: 'current-password' }
]

// Sections data with dynamic keys
const loginSections = computed(() => Array.from({ length: 3 }, (_, i) => ({ titleKey: `loginSection${i + 1}Title`, contentKey: `loginSection${i + 1}Content` })))

// SEO reactive to language changes
const pageKey = 'login'
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))

// Setup DB on mount, only log in dev
onMounted(async () => {
    try {
        const res = await $fetch('/api/database/setup')
        if (isDev.value) console.log('[DEV] DB setup:', res)
    } catch (e) { if (isDev.value) console.error('[DEV] DB setup failed:', e) }
})

// Translate error messages reactively
const { translatedMessage } = useTranslatedMessage(errorMessage)

// Handle login submission
const handleLogin = async () => {
    const { email, password } = form.value
    const res = await login(email, password)
    errorMessage.value = res.success
        ? { type: 'success', key: 'loginSuccess' }
        : { type: 'error', key: res.error || 'authError' }
}

definePageMeta({ middleware: 'guest-server' })
</script>

<style scoped>
.login-form-wrapper {
    text-align: left;
    margin-top: 2rem
}

.form-group {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-bottom: 2rem
}
</style>