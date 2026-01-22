<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewProjects')" @close="close">
        <div class="projects-list-modal">
            <!-- Search input -->
            <div class="search-bar">
                <input v-model="search" type="text" :placeholder="$lang.getTranslation('searchProjects')"
                    class="text-small" autocomplete="off" :title="$lang.getTranslation('searchProjects')" />
            </div>

            <!-- Editable table -->
            <EditableTable :items="filteredApiProjects" :columns="columns"
                :actions-label="$lang.getTranslation('actions')" :delete-label="$lang.getTranslation('delete')"
                :empty-message="$lang.getTranslation('noProjectsFound')" @update="handleUpdate"
                @delete="deleteProject" />

            <!-- Footer -->
            <div class="modal-footer">
                <HeroButton type="button" :label="$lang.getTranslation('close')" iconClass="fas fa-times"
                    @click="close" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useProjects } from '~/composables/useProjects'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

const { $lang, projects, fetchProjects, updateProject, removeProject } = useProjects()
const search = ref('')

// Filter projects from API only
const apiProjects = computed(() => projects.value.filter(p => p.short_fr && p.short_en))
const filteredApiProjects = computed(() => {
    const q = search.value.toLowerCase().trim()
    if (!q) return apiProjects.value
    return apiProjects.value.filter(p =>
        [p.name, p.short_fr, p.short_en, p.link, ...(p.skills || [])].some(v =>
            v?.toString().toLowerCase().includes(q)
        )
    )
})

// Skills options
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
    photoshop: $lang.getTranslation('photoshop'),
}))

// Columns for EditableTable
const columns = computed(() => [
    {
        key: 'name',
        label: $lang.getTranslation('projectName'),
        formatter: p => p.name || '-'
    },
    {
        key: 'short_fr',
        label: $lang.getTranslation('projectShortFr'),
        formatter: p => p.short_fr || '-'
    },
    {
        key: 'short_en',
        label: $lang.getTranslation('projectShortEn'),
        formatter: p => p.short_en || '-'
    },
    {
        key: 'img',
        label: $lang.getTranslation('projectImage'),
        type: 'file',
        formatter: p => {
            if (!p.img) return '-'
            const imgSrc = p.img.startsWith('api/')
                ? `${window.location.origin}/${p.img}`
                : p.img
            return `<img src="${imgSrc}" alt="${p.name}" style="max-height:25px"/>`
        }
    },
    {
        key: 'skills',
        label: $lang.getTranslation('projectSkills'),
        type: 'select',
        multiple: true,
        options: Object.entries(skillOptions.value).map(([value, label]) => ({ value, label })),
        formatter: p => (p.skills && p.skills.length)
            ? p.skills.map(s => skillOptions.value[s] || s).join(', ')
            : '-'
    },
    {
        key: 'link',
        label: $lang.getTranslation('projectLink'),
        formatter: p => p.link || '-'
    },
    {
        key: 'date',
        label: $lang.getTranslation('projectDate'),
        inputType: 'date',
        formatter: p => p.date ? new Date(p.date).toLocaleDateString() : '-',
        editValue: p => p.date
    }
])

// Handle updates for text, select multiple, and file
const handleUpdate = async ({ item, field, value, file }) => {
    const updates = {}
    let imageFile = null

    if (field === 'img' && file) {
        imageFile = file
    } else if (field === 'skills' && Array.isArray(value)) {
        updates[field] = value
    } else {
        updates[field] = value
    }

    await updateProject(item.id, updates, imageFile)
}

// Delete project
const deleteProject = async item => {
    if (!confirm($lang.getTranslation('deleteProjectConfirm', { name: item.name }))) return
    await removeProject(item.id)
}

watch(() => props.show, val => val && fetchProjects())
const close = () => emit('close')
</script>

<style scoped>
.projects-list-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 1920px;
    min-width: 60vw;
    max-height: 80vh;
    overflow: hidden;
    color: var(--text-color-dark);
    box-sizing: border-box;
}

.search-bar {
    display: flex;
    justify-content: flex-end;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto;
}
</style>