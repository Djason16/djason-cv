<template>
    <!-- New project of the home page (image, skills, texts fr / en) -->
    <FormModal :show="show" :title="t('addProjects')" :message="translatedMessage" :loading="formLoading"
        @close="close" @submit="handleSubmit">
        <!-- Dynamic fields -->
        <div v-for="f in projectFields" :key="f.id" class="form-group">
            <label :for="f.id">{{ t(f.labelKey) }}</label>

            <!-- File input -->
            <input v-if="f.type === 'file'" :id="f.id" type="file" :accept="f.accept" @change="onFileChange" />

            <!-- Skills multi-select -->
            <select v-else-if="f.id === 'skills'" :id="f.id" v-model="form.skills" multiple
                :title="t(f.labelKey)" :aria-label="t(f.labelKey)">
                <option v-for="(label, key) in skillOptions" :key="key" :value="key">{{ label }}</option>
            </select>

            <!-- Text/date input -->
            <input v-else :id="f.id" v-model="form[f.id]" :type="f.type" :required="f.required"
                :placeholder="t(f.placeholderKey)" :title="t(f.labelKey)"
                :aria-label="t(f.labelKey)" />
        </div>
    </FormModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { ref, reactive, computed } from 'vue'
import FormModal from '@/components/ui/Modal/FormModal.vue'
import { useProjects } from '@/composables/useProjects.js'
import { useMessage } from '@/composables/useMessage.js'

defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

// Composables
const lang = useLang()
const { getTranslation: t } = lang
const { projectFields, addProject } = useProjects()
const { translatedMessage, showMessage, clearMessage } = useMessage()

// Reactive state
const formLoading = ref(false)
const imageFile = ref(null)
const form = reactive({ name: '', short_fr: '', short_en: '', link: '', skills: [], date: '' })

// Skill options mapped to translations
const skillOptions = computed(() => ({
    editing: lang.getTranslation('editing'),
    vfx: lang.getTranslation('vfx'),
    compositing: lang.getTranslation('compositing'),
    tracking: lang.getTranslation('tracking'),
    motionDesign: lang.getTranslation('motionDesign'),
    threeDimensional: lang.getTranslation('threeDimensional'),
    animation: lang.getTranslation('animation'),
    vue: lang.getTranslation('vue'),
    slimPHP: lang.getTranslation('slimPHP'),
    nodejs: lang.getTranslation('nodejs'),
    stripe: lang.getTranslation('stripe'),
    nuxt: lang.getTranslation('nuxt'),
    nitro: lang.getTranslation('nitro'),
    docker: lang.getTranslation('docker'),
    infomaniak: lang.getTranslation('infomaniak'),
    o2switch: lang.getTranslation('o2switch'),
    git: lang.getTranslation('git'),
    github: lang.getTranslation('github'),
    responsive: lang.getTranslation('responsive'),
    figma: lang.getTranslation('figma'),
    photoshop: lang.getTranslation('photoshop')
}))

// File change handler
const onFileChange = e => imageFile.value = e.target.files?.[0] || null

// Closes and resets form
const close = () => {
    Object.keys(form).forEach(k => form[k] = k === 'skills' ? [] : '')
    imageFile.value = null
    formLoading.value = false
    clearMessage()
    emit('close')
}

// Saves the project, then closes the modal
const handleSubmit = async () => {
    clearMessage()
    formLoading.value = true
    try {
        const res = await addProject({ ...form }, imageFile.value)
        if (!res?.success) throw new Error(res?.error || 'error')
        showMessage('success', lang.getTranslation('projectAdded'), 1500)
        setTimeout(() => { close(); emit('saved') }, 1500)
    } catch (e) {
        showMessage('error', e.message || lang.getTranslation('errorSavingProject'))
    } finally { formLoading.value = false }
}
</script>
