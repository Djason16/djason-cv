<template>
    <!-- Login page via reusable section layout -->
    <OtherSectionLayout pageTitleKey="loginTitle" pageSubtitleKey="loginSubtitle" :sections="loginSections"
        titleTag="h1" titleClass="text-xlarge text-bold" titleColor="var(--text-color-light)" contentClass="text-normal"
        contentColor="var(--text-color-light)">
        <template v-slot:custom-content>
            <div class="login-form-wrapper">
                <SlideInFromRight>
                    <!-- Render form fields dynamically -->
                    <div v-for="field in formFields" :key="field.id" class="form-group text-large">
                        <label :for="field.id">{{ $lang.getTranslation(field.labelKey) }}</label>
                        <input :id="field.id" v-model="form[field.model]" :type="field.type"
                            :placeholder="$lang.getTranslation(field.placeholderKey)" :required="field.required"
                            :autocomplete="field.autocomplete" form="login-dummy-form" @keyup.enter="handleLogin" />
                    </div>

                    <!-- Login button with dynamic loading label -->
                    <HeroButton :label="$lang.getTranslation(authLoading ? 'loggingIn' : 'loginButton')"
                        iconClass="fas fa-sign-in-alt" :disabled="authLoading" @click="handleLogin" />
                </SlideInFromRight>

                <!-- Display success/error messages -->
                <MessageBox :message="errorMessage" />

                <!-- Hidden form to satisfy browser submit behavior -->
                <form id="login-dummy-form" @submit.prevent="handleLogin" style="display: none;"></form>
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

const { $lang } = useNuxtApp()
const { login, loading: authLoading, error: authError } = useAuth()

// Environment and form state
const isDev = useState('isDev', () => process.env.NODE_ENV === 'development')
const devCredentials = ref(null)
const form = ref({ email: '', password: '' })
const errorMessage = ref(null)

// Sync composable auth errors to local message
watch(authError, newError => { if (newError) errorMessage.value = newError })

// Define form fields dynamically
const formFields = [
    { id: 'email', type: 'email', model: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', required: true, autocomplete: 'email' },
    { id: 'password', type: 'password', model: 'password', labelKey: 'passwordLabel', placeholderKey: 'passwordPlaceholder', required: true, autocomplete: 'current-password' }
]

// Generate login page sections; include dev creds if in development mode
const loginSections = computed(() => {
    const base = Array.from({ length: 3 }, (_, i) => ({
        titleKey: `loginSection${i + 1}Title`,
        contentKey: `loginSection${i + 1}Content`
    }))
    return isDev.value && devCredentials.value
        ? [...base, { titleKey: 'devSectionTitle', contentKey: 'devSectionContent', dynamicData: devCredentials.value }]
        : base
})

// SEO setup
const pageKey = 'login'
useSeoMeta(seoMetaData(pageKey, $lang))
watch(() => $lang.current.value, () => useSeoMeta(seoMetaData(pageKey, $lang)))

// Initialize DB and fetch dev credentials if in dev
onMounted(async () => {
    try { console.log('DB setup result:', await $fetch('/api/database/setup')) }
    catch (err) { console.error('Database setup failed:', err) }
    if (isDev.value) {
        try { devCredentials.value = await $fetch('/api/auth/dev-credentials') }
        catch { console.warn('Could not load dev credentials'); devCredentials.value = null }
    }
})

// Handle login submission
const handleLogin = async () => {
    const { email, password } = form.value
    const result = await login(email, password)

    errorMessage.value = result.success ? result.message : result.error
}

definePageMeta({ middleware: 'guest-server' })
</script>

<style scoped>
.login-form-wrapper {
    text-align: left;
    margin-top: 2rem
}

.form-group {
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.25rem
}
</style>