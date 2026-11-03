<template>
    <!-- My information: identity, legal details and social links shown on the site, the documents and the emails (stores/siteSettings.js) -->
    <FormModal :show="show" :title="t('settingsTitle')" :message="translatedMessage" :loading="formLoading" :columns="4"
        @close="close" @submit="handleSubmit">

        <!-- Photo of "About me": saved as soon as it is picked, or back to the photo of the site -->
        <div class="settings-photo is-wide">
            <img :src="photoSrc" :alt="t('settingAboutPhoto')" :title="t('settingAboutPhoto')" class="settings-photo__preview" width="120" height="150" />
            <div class="settings-photo__body">
                <label for="setting-about-photo" class="text-label">{{ t('settingAboutPhoto') }}</label>
                <p class="settings-photo__hint text-body-s">{{ t('settingAboutPhotoHint') }}</p>
                <input id="setting-about-photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif"
                    :disabled="photoLoading" @change="pickPhoto" />
                <HeroButton v-if="siteSettings.values.aboutPhoto" type="button" iconClass="fas fa-undo"
                    :label="t('settingAboutPhotoReset')" :disabled="photoLoading" @click="savePhoto(null)" />
            </div>
        </div>

        <!-- Fields four by four on a computer (FormModal columns), two by two on a tablet -->
        <div v-for="(group, i) in FIELD_ROWS" :key="i" class="row-group">
            <div v-for="f in group" :key="f.id" class="form-group">
                <label :for="`setting-${f.id}`">{{ labelOf(f) }}</label>
                <input :id="`setting-${f.id}`" v-model="form[f.id]" :type="f.type"
                    :placeholder="f.placeholderKey ? t(f.placeholderKey) : f.placeholder" :title="labelOf(f)"
                    :aria-label="labelOf(f)" :autocomplete="f.autocomplete" />
            </div>
        </div>
    </FormModal>
</template>

<script setup>
import { MESSAGE_DELAY, afterMessage } from '@/utils/feedback.js'
import { computed, reactive, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import FormModal from '@/components/ui/Modal/FormModal.vue'
import { useLang } from '@/composables/useLang.js'
import { useMessage } from '@/composables/useMessage.js'
import { useSiteSettingsStore } from '@/stores/siteSettings.js'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const { getTranslation: t } = useLang()
const siteSettings = useSiteSettingsStore()
const { translatedMessage, showMessage, clearMessage } = useMessage()
const formLoading = ref(false)

// Rows of the form (a new setting: stores/siteSettings.js); brand names are shown as they are
const FIELD_ROWS = [
    [
        { id: 'name', labelKey: 'settingName', placeholderKey: 'enterSettingName', type: 'text', autocomplete: 'name' },
        { id: 'birthDate', labelKey: 'settingBirthDate', type: 'date', autocomplete: 'bday' },
    ],
    [
        { id: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', type: 'email', autocomplete: 'email' },
        { id: 'phone', labelKey: 'phoneNumber', placeholderKey: 'enterPhone', type: 'tel', autocomplete: 'tel' },
    ],
    [
        { id: 'siret', labelKey: 'siret', placeholderKey: 'enterSiret', type: 'text', autocomplete: 'off' },
        { id: 'tva', labelKey: 'settingTva', placeholderKey: 'enterSettingTva', type: 'text', autocomplete: 'off' },
    ],
    [{ id: 'address', labelKey: 'settingAddress', placeholderKey: 'enterSettingAddress', type: 'text', autocomplete: 'address-level2' }],
    [{ id: 'invoiceAddress', labelKey: 'settingInvoiceAddress', placeholderKey: 'enterSettingInvoiceAddress', type: 'text', autocomplete: 'street-address' }],
    [
        { id: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/...', type: 'url', autocomplete: 'off' },
        { id: 'github', label: 'GitHub', placeholder: 'https://github.com/...', type: 'url', autocomplete: 'off' },
    ],
    [
        { id: 'malt', label: 'Malt', placeholder: 'https://www.malt.fr/profile/...', type: 'url', autocomplete: 'off' },
        { id: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/...', type: 'url', autocomplete: 'off' },
    ],
    [{ id: 'whatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/33...', type: 'url', autocomplete: 'off' }],
    // Consumer mediator: required as soon as you work for individuals, printed in the terms (CGV)
    [
        { id: 'mediatorName', labelKey: 'settingMediatorName', placeholder: 'CM2C, Médiation-Net…', type: 'text', autocomplete: 'off' },
        { id: 'mediatorUrl', labelKey: 'settingMediatorUrl', placeholder: 'https://…', type: 'url', autocomplete: 'off' },
    ],
    [{ id: 'mediatorAddress', labelKey: 'settingMediatorAddress', placeholder: '14 rue Saint-Jean, 75017 Paris', type: 'text', autocomplete: 'off' }],
]

// Photo of "About me": the uploaded one, or the photo of the site
const photoLoading = ref(false)
const photoSrc = computed(() => siteSettings.values.aboutPhoto ? `/api${siteSettings.values.aboutPhoto}` : '/images/about-me.jpg')
const savePhoto = async file => {
    clearMessage()
    photoLoading.value = true
    const res = await siteSettings.savePhoto(file)
    photoLoading.value = false
    showMessage(res.success ? 'success' : 'error', t(res.success ? 'saveSuccess' : 'saveFailed'), res.success ? 1500 : 0)
}
const pickPhoto = event => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) savePhoto(file)
}

// Label of a field: a translated text, or a brand name as it is
const labelOf = field => field.label || t(field.labelKey)

// Copy of the current settings, edited in the form (the site changes only once saved)
const form = reactive({ ...siteSettings.values })
watch(() => props.show, open => { if (open) Object.assign(form, siteSettings.values) })

// Closes the modal and clears its message
const close = () => {
    clearMessage()
    formLoading.value = false
    emit('close')
}

// Saves the form and shows the result in the modal: the site, the documents and the emails use the new values at once
const handleSubmit = async () => {
    clearMessage()
    formLoading.value = true
    const res = await siteSettings.save({ ...form })
    formLoading.value = false
    if (!res.success) return showMessage('error', t('saveFailed'), 0)

    showMessage('success', t('saveSuccess'), MESSAGE_DELAY)
    await afterMessage()
    close()
}
</script>

<style scoped>
/* Photo of "About me": a small portrait, its name, a hint, the file field and the way back to the photo of the site */
.settings-photo {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--line);
}

.settings-photo__preview {
    flex-shrink: 0;
    width: 4.5rem;
    height: auto;
    aspect-ratio: 4 / 5;
    object-fit: cover;
    object-position: center 20%;
    background: var(--ink-700);
}

.settings-photo__body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    min-width: 0;
}

.settings-photo__hint {
    margin: 0;
    color: var(--fg-muted);
}
</style>
