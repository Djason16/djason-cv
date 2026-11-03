<template>
    <!-- Project of the home page, new or changed (project prop): image, texts fr / en, skills (known ones or new ones), link, date -->
    <FormModal :show="show" :title="t(project ? 'editProject' : 'addProjects')" :message="translatedMessage" :loading="formLoading"
        :columns="2" @close="close" @submit="handleSubmit">
        <div v-for="f in fields" :key="f.id" class="form-group" :class="{ 'is-wide': f.id === 'skills' }">
            <label :for="f.id">{{ t(f.labelKey) }}
                <!-- The French fills the English (MyMemory): shown while it works -->
                <span v-if="auto.status[f.id]" class="auto-translate text-body-s">{{ t(auto.status[f.id] === 'done' ? 'translateDone' : 'translating') }}</span>
            </label>

            <!-- Image: the current one shown while editing, a new file replaces it -->
            <div v-if="f.type === 'file'" class="project-form__image">
                <img v-if="preview" :src="preview" :alt="t('projectImage')" :title="t('projectImage')" class="project-form__thumb" />
                <span v-else class="project-form__thumb project-form__thumb--empty" aria-hidden="true"><i class="fas fa-image"></i></span>
                <label class="project-form__pick text-label">
                    <input :id="f.id" type="file" :accept="f.accept" class="project-form__file" @change="onFileChange" />
                    <i class="fas fa-upload" aria-hidden="true"></i> {{ t(preview ? 'changeImage' : 'selectImage') }}
                </label>
            </div>

            <!-- Short texts: a few lines -->
            <textarea v-else-if="f.id.startsWith('short_')" :id="f.id" v-model="form[f.id]" rows="3" :required="f.required"
                :placeholder="t(f.placeholderKey)" :aria-label="t(f.labelKey)"></textarea>

            <!-- Skills: tags, picked among the known ones or typed -->
            <TagPicker v-else-if="f.id === 'skills'" :id="f.id" v-model="form.skills" :options="projectSkillOptions"
                :placeholder="t('enterSkills')" :remove-label="t('delete')" />

            <!-- Text / date -->
            <input v-else :id="f.id" v-model="form[f.id]" :type="f.type" :required="f.required"
                :placeholder="t(f.placeholderKey)" :title="t(f.labelKey)" :aria-label="t(f.labelKey)" />
        </div>
    </FormModal>
</template>

<script setup>
import { MESSAGE_DELAY, afterMessage } from '@/utils/feedback.js'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import TagPicker from '@/components/ui/Form/TagPicker.vue'
import FormModal from '@/components/ui/Modal/FormModal.vue'
import { useLang } from '@/composables/useLang.js'
import { useMessage } from '@/composables/useMessage.js'
import { useProjects } from '@/composables/useProjects.js'
import { useSkills } from '@/composables/useSkills.js'
import { useAutoTranslate } from '@/composables/useAutoTranslate.js'

const props = defineProps({
    show: Boolean,
    // Project to change (from the list of projects); none = a new project
    project: { type: Object, default: null },
})
const emit = defineEmits(['close', 'saved'])

const { getTranslation: t } = useLang()
const { projectFields, addProject, updateProject } = useProjects()
const { projectSkillOptions, fetchSkills } = useSkills()
const { translatedMessage, showMessage, clearMessage } = useMessage()

const FIELDS = ['name', 'short_fr', 'short_en', 'link', 'skills', 'date']
// Order of the form, two by two: name and date, the two texts, image and link, then the skills on the whole line
const ORDER = ['name', 'date', 'short_fr', 'short_en', 'img', 'link', 'skills']
const fields = ORDER.map(id => projectFields.find(f => f.id === id))
const empty = () => ({ name: '', short_fr: '', short_en: '', link: '', skills: [], date: '' })
const formLoading = ref(false)
const imageFile = ref(null)
const filePreview = ref('')
const form = reactive(empty())
// Values when the modal opened: only the changed fields are sent
let initial = empty()
// French text -> English text, a moment after typing (never over an English changed by hand)
const auto = useAutoTranslate(form, [['short_fr', 'short_en']])

// Image shown: the new file, otherwise the current image of the project
const projectImage = computed(() => props.project?.img ? (props.project.img.startsWith('api/') ? `/${props.project.img}` : props.project.img) : '')
const preview = computed(() => filePreview.value || projectImage.value)

const onFileChange = e => {
    imageFile.value = e.target.files?.[0] || null
    if (filePreview.value) URL.revokeObjectURL(filePreview.value)
    filePreview.value = imageFile.value ? URL.createObjectURL(imageFile.value) : ''
}

// Each opening: the values of the project (or an empty form) and the latest skills
watch(() => props.show, open => {
    if (!open) return
    const p = props.project
    initial = p ? { ...Object.fromEntries(FIELDS.map(k => [k, p[k] ?? ''])), skills: [...(p.skills || [])], date: p.date ? String(p.date).slice(0, 10) : '' } : empty()
    Object.assign(form, structuredClone(initial))
    auto.reset()
    fetchSkills()
}, { immediate: true })

const close = () => {
    Object.assign(form, empty())
    auto.reset()
    onFileChange({ target: {} })
    formLoading.value = false
    clearMessage()
    emit('close')
}

// Fields changed since the modal opened
const changes = () => FIELDS.filter(k => JSON.stringify(form[k]) !== JSON.stringify(initial[k]))
    .reduce((acc, k) => ({ ...acc, [k]: form[k] }), {})

// Saves, then closes the modal
const handleSubmit = async () => {
    clearMessage()
    formLoading.value = true
    try {
        const res = props.project
            ? (Object.keys(changes()).length || imageFile.value ? await updateProject(props.project.id, changes(), imageFile.value) : { success: true })
            : await addProject({ ...form }, imageFile.value)
        if (!res?.success) throw new Error(res?.error || 'error')
        showMessage('success', t(props.project ? 'saveSuccess' : 'projectAdded'), MESSAGE_DELAY)
        await afterMessage()
        close()
        emit('saved')
    } catch (e) {
        showMessage('error', e.message || t('errorSavingProject'))
    } finally { formLoading.value = false }
}

onBeforeUnmount(() => filePreview.value && URL.revokeObjectURL(filePreview.value))
</script>

<style scoped>
/* Current image (small) beside the file field */
.project-form__image {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.project-form__thumb {
    width: 96px;
    height: 54px;
    flex-shrink: 0;
    object-fit: cover;
    background: var(--panel);
}

.project-form__thumb--empty {
    display: grid;
    place-items: center;
    color: var(--fg-muted);
}

/* The file field hidden behind a quiet button */
.project-form__pick {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.7rem 1rem;
    background: var(--panel);
    color: var(--fg);
    cursor: pointer;
    transition: background-color var(--motion-fast) var(--ease), color var(--motion-fast) var(--ease);
}

.project-form__pick:hover,
.project-form__pick:focus-within {
    background: rgba(126, 230, 168, 0.12);
    color: var(--mint);
}

.project-form__file {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
}
</style>
