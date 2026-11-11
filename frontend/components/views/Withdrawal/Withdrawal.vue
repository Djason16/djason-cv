<!-- Online withdrawal of a consumer (art. L.221-21 of the French Consumer Code, since 19 June 2026): a short form sent to
/api/withdrawals (an acknowledgement by email at once), then the rules and the model withdrawal form (texts: plugins/translations/pages/withdrawal.js) -->
<template>
    <OtherSectionLayout pageTitleKey="withdrawalTitle" pageSubtitleKey="withdrawalPageIntro" :sections="sections" :dynamicData="providerInfo">
        <template #custom-content>
            <div v-reveal class="withdrawal-form">
                <Transition name="swap" mode="out-in">
                    <!-- Sent: what happens now -->
                    <div v-if="sent" key="sent" class="withdrawal-form__done">
                        <p class="eyebrow">{{ t('withdrawalSentLabel') }}</p>
                        <p class="text-body-l">{{ t(emailSent ? 'withdrawalSent' : 'withdrawalSentNoEmail', { email: form.email }) }}</p>
                    </div>

                    <form v-else key="form" @submit.prevent="submit">
                        <div v-for="field in FIELDS" :key="field.id" class="form-group text-label">
                            <label :for="field.id">{{ t(field.labelKey) }}</label>
                            <FormInput :id="field.id" v-model="form[field.model]" :type="field.type" :placeholder="t(field.placeholderKey)"
                                :required="field.required" :autocomplete="field.autocomplete" @enter="submit" />
                        </div>
                        <div class="form-group text-label">
                            <label for="withdrawal-message">{{ t('withdrawalMessage') }}</label>
                            <textarea id="withdrawal-message" v-model="form.message" class="withdrawal-form__message" rows="3"
                                :placeholder="t('withdrawalMessagePlaceholder')"></textarea>
                        </div>
                        <HeroButton type="submit" primary iconClass="fas fa-undo" :label="t(sending ? 'withdrawalSending' : 'withdrawalSubmit')" :disabled="sending" />
                    </form>
                </Transition>

                <MessageBox :message="translatedMessage" />
            </div>
        </template>
    </OtherSectionLayout>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import FormInput from '@/components/ui/Form/FormInput.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import OtherSectionLayout from '@/components/ui/SectionLayout/OtherSectionLayout.vue'
import { useLang } from '@/composables/useLang'
import { useMessage } from '@/composables/useMessage'
import { useSite } from '@/composables/useSite'
import { api } from '@/utils/api'

const lang = useLang()
const t = lang.getTranslation
const site = useSite()
const { translatedMessage, showMessage, clearMessage } = useMessage()

const providerInfo = computed(() => ({ name: site.name, email: site.email, address: site.address || site.invoiceAddress }))

// The fields of the form: who, how to answer, which contract
const FIELDS = [
    { id: 'withdrawal-name', model: 'name', type: 'text', labelKey: 'withdrawalName', placeholderKey: 'withdrawalNamePlaceholder', required: true, autocomplete: 'name' },
    { id: 'withdrawal-email', model: 'email', type: 'email', labelKey: 'withdrawalEmail', placeholderKey: 'withdrawalEmailPlaceholder', required: true, autocomplete: 'email' },
    { id: 'withdrawal-reference', model: 'reference', type: 'text', labelKey: 'withdrawalReference', placeholderKey: 'withdrawalReferencePlaceholder', required: true, autocomplete: 'off' },
]
const form = reactive<{ name: string, email: string, reference: string, message: string, [field: string]: string }>({ name: '', email: '', reference: '', message: '' })
const sending = ref(false)
const sent = ref(false)
const emailSent = ref(true)

const submit = async () => {
    clearMessage()
    if (form.name.trim().length < 2) return showMessage('error', 'withdrawalNameRequired', 0)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return showMessage('error', 'invalidEmail', 0)
    if (form.reference.trim().length < 2) return showMessage('error', 'withdrawalReferenceRequired', 0)
    sending.value = true
    const res = await api.post('/withdrawals', { ...form, language: lang.current.value })
    sending.value = false
    if (!res.success) return showMessage('error', res.error || 'unknownError', 0)
    emailSent.value = res.emailSent !== false
    sent.value = true
}

// The rules of the withdrawal, then the model form
const sections = Array.from({ length: 4 }, (_, i) => ({ titleKey: `withdrawalSection${i + 1}Title`, contentKey: `withdrawalSection${i + 1}Content` }))
</script>

<style scoped>
.withdrawal-form {
    max-width: 520px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
}

/* Long text: the same line under the text as the other fields */
.withdrawal-form__message {
    width: 100%;
    padding: 0.6rem 0;
    box-sizing: border-box;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.28);
    background: transparent;
    color: var(--fg);
    font: inherit;
    font-size: var(--font-body);
    letter-spacing: normal;
    text-transform: none;
    resize: vertical;
}

.withdrawal-form__message:focus {
    outline: none;
    border-bottom-color: var(--accent);
}

.withdrawal-form__done {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem 1.75rem;
    border-left: 2px solid var(--accent);
    background: var(--panel);
}
</style>
