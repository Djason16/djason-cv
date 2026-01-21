<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('addProjects')" @close="close">
        <form ref="formRef" class="projects-form" :class="{ 'has-scroll': hasScroll }" @submit.prevent="handleSubmit">
            <!-- Dynamic fields -->
            <div v-for="f in projectFields" :key="f.id" class="form-group">
                <label :for="f.id">{{ $lang.getTranslation(f.labelKey) }}</label>

                <!-- File input -->
                <input v-if="f.type === 'file'" :id="f.id" type="file" :accept="f.accept" @change="onFileChange" />

                <!-- Skills multi-select -->
                <select v-else-if="f.id === 'skills'" :id="f.id" v-model="form.skills" multiple
                    :title="$lang.getTranslation(f.labelKey)" :aria-label="$lang.getTranslation(f.labelKey)">
                    <option v-for="(label, key) in skillOptions" :key="key" :value="key">{{ label }}</option>
                </select>

                <!-- Text/date input -->
                <input v-else :id="f.id" v-model="form[f.id]" :type="f.type" :required="f.required"
                    :placeholder="$lang.getTranslation(f.placeholderKey)" :title="$lang.getTranslation(f.labelKey)"
                    :aria-label="$lang.getTranslation(f.labelKey)" />
            </div>

            <MessageBox :message="translatedMessage" />

            <!-- Actions -->
            <div class="modal-footer">
                <HeroButton type="button" iconClass="fas fa-times" :label="$lang.getTranslation('cancel')"
                    @click="close" />
                <HeroButton type="submit" iconClass="fas fa-check" :disabled="formLoading"
                    :label="formLoading ? $lang.getTranslation('saving') : $lang.getTranslation('save')" />
            </div>
        </form>
    </ModalDialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import ModalDialog from '../ModalDialog.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import { useProjects } from '~/composables/useProjects'
import { useMessage } from '~/composables/useMessage'

// Props and emits
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

// Composables
const { $lang, projectFields, addProject } = useProjects()
const { translatedMessage, showMessage, clearMessage } = useMessage()

// Reactive state
const formRef = ref(null)
const hasScroll = ref(false)
const formLoading = ref(false)
const imageFile = ref(null)
const form = reactive({ name: '', short_fr: '', short_en: '', link: '', skills: [], date: '' })

// Skill options mapped to translations
const skillOptions = computed(() => ({
    editing: $lang.getTranslation('editing'),
    vfx: $lang.getTranslation('vfx'),
    compositing: $lang.getTranslation('compositing'),
    tracking: $lang.getTranslation('tracking'),
    motionDesign: $lang.getTranslation('motionDesign'),
    threeDimensional: $lang.getTranslation('threeDimensional'),
    animation: $lang.getTranslation('animation'),
    vue: $lang.getTranslation('vue'),
    slimPHP: $lang.getTranslation('slimPHP'),
    nodejs: $lang.getTranslation('nodejs'),
    stripe: $lang.getTranslation('stripe'),
    nuxt: $lang.getTranslation('nuxt'),
    nitro: $lang.getTranslation('nitro'),
    docker: $lang.getTranslation('docker'),
    infomaniak: $lang.getTranslation('infomaniak'),
    o2switch: $lang.getTranslation('o2switch'),
    git: $lang.getTranslation('git'),
    github: $lang.getTranslation('github'),
    responsive: $lang.getTranslation('responsive'),
    figma: $lang.getTranslation('figma'),
    photoshop: $lang.getTranslation('photoshop')
}))

// Scroll detection
const checkScroll = () => formRef.value && (hasScroll.value = formRef.value.scrollHeight > formRef.value.clientHeight)
let observer = null
watch(() => props.show, visible => {
    if (!visible) { observer?.disconnect(); observer = null; return }
    setTimeout(() => {
        if (!formRef.value) return
        checkScroll()
        observer = new MutationObserver(() => setTimeout(checkScroll, 50))
        observer.observe(formRef.value, { childList: true, subtree: true, characterData: true })
    }, 50)
})
onMounted(() => window.addEventListener('resize', checkScroll))
onBeforeUnmount(() => { observer?.disconnect(); window.removeEventListener('resize', checkScroll) })

// File change handler
const onFileChange = e => imageFile.value = e.target.files?.[0] || null

// Close and reset form
const close = () => {
    Object.keys(form).forEach(k => form[k] = k === 'skills' ? [] : '')
    imageFile.value = null
    formLoading.value = false
    clearMessage()
    emit('close')
}

// Submit handler
const handleSubmit = async () => {
    clearMessage()
    formLoading.value = true
    try {
        const res = await addProject({ ...form }, imageFile.value)
        if (!res?.success) throw new Error(res?.error || 'error')
        showMessage('success', $lang.getTranslation('projectAdded'), 1500)
        setTimeout(() => { close(); emit('saved') }, 1500)
    } catch (e) {
        showMessage('error', e.message || $lang.getTranslation('errorSavingProject'))
    } finally { formLoading.value = false }
}
</script>

<style scoped>
.projects-form,
.form-group,
.modal-footer {
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease
}

.projects-form {
    gap: 2rem;
    min-width: 25vw;
    max-width: 90vw;
    max-height: 60vh;
    overflow-y: auto;
    padding: 0;
    box-sizing: border-box
}

.projects-form.has-scroll {
    padding-right: 1rem
}

.form-group {
    gap: 0.5rem
}

.modal-footer {
    gap: 1rem;
    margin-top: auto
}

::v-deep(.message-box p) {
    margin: 0
}

@media (max-width: 1024px) {
    .projects-form {
        width: 100%;
        min-width: auto;
        max-width: 90vw
    }
}
</style>