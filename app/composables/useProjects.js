import { useLang } from './useLang.js'
import { computed, ref } from 'vue'
import { projects as rawProjects } from '@/data/projects.js'
import { api } from '@/utils/api.js'

// Projects of the home page: static ones (data/projects.js) and the ones added from the admin page (/api/projects)
export const useProjects = () => {
    const lang = useLang()
    const projects = ref([])
    const loading = ref(false)
    const search = ref('')

    // Normalizes a project object
    const normalizeProject = p => {
        if (!p) return null

        const isApi = p.short_fr && p.short_en

        return {
            id: p.id ?? crypto.randomUUID(),
            name: p.name || '',
            img: isApi && p.img ? `api${p.img}` : p.img || '',
            image: isApi && p.img ? `api${p.img}` : p.img || '',
            link: p.link || null,
            skills: Array.isArray(p.skills) ? p.skills : [],
            date: p.date || new Date().toISOString().split('T')[0],

            shortKey: !isApi ? p.short || '' : null,
            short_fr: isApi ? p.short_fr : null,
            short_en: isApi ? p.short_en : null,

            get short() {
                if (this.short_fr && this.short_en) {
                    return lang.current.value === 'en' ? this.short_en : this.short_fr
                }
                return lang.getTranslation(this.shortKey)
            },
        }
    }

    // Determines display description based on language
    const displayProjectShort = p =>
        p?.short_fr && p?.short_en
            ? lang.current.value === 'en'
                ? p.short_en
                : p.short_fr
            : lang.getTranslation(p?.shortDescriptionKey)

    // Fetches projects from raw data and API
    const fetchProjects = async () => {
        loading.value = true
        try {
            const combined = rawProjects.map(normalizeProject).filter(Boolean)

            // Projects added from the admin page; local data only when the API is unreachable
            const res = await api.get('/projects')
            if (res.success) combined.push(...res.projects.map(normalizeProject).filter(Boolean))
            else console.warn('API unreachable, using local data only', res.error)

            projects.value = combined.sort((a, b) => new Date(b.date) - new Date(a.date))
        } catch (e) {
            console.error('Project loading failed', e)
            projects.value = rawProjects
                .map(normalizeProject)
                .filter(Boolean)
                .sort((a, b) => new Date(b.date) - new Date(a.date))
        } finally {
            loading.value = false
        }
    }

    // Filters projects by search query
    const filteredProjects = computed(() => {
        const q = search.value.toLowerCase().trim()
        if (!q) return projects.value
        return projects.value.filter(p =>
            [p.name, displayProjectShort(p), p.link, ...(p.skills || [])].some(v =>
                v?.toString().toLowerCase().includes(q)
            )
        )
    })

    const displayProjectName = p => p?.name || '-'
    const displayValue = v => v ?? '-'

    // Converts project object to FormData
    const createFormData = (project, imageFile = null) => {
        const fd = new FormData()
            ;['id', 'name', 'short_fr', 'short_en', 'link', 'date'].forEach(
                k => project[k] && fd.append(k, project[k])
            )
        if (project.skills) {
            fd.append('skills', Array.isArray(project.skills) ? JSON.stringify(project.skills) : project.skills)
        }
        if (imageFile) fd.append('image', imageFile)
        return fd
    }

    // Adds new project (API projects only)
    const addProject = async (project, imageFile = null) => {
        const res = await api.post('/projects', createFormData(project, imageFile))

        if (res.success) {
            const normalized = normalizeProject({
                ...project,
                id: res.id,
                img: res.imagePath || project.img,
            })
            if (normalized) projects.value.unshift(normalized)
        } else console.error('Project creation failed', res.error)

        return res
    }

    // Updates existing project
    const updateProject = async (id, updates = {}, imageFile = null) => {
        let res

        if (imageFile) {
            res = await api.post(`/projects/${id}/image`, createFormData({}, imageFile))
            if (res.success) {
                const newImg = `api${res.imagePath}`
                const i = projects.value.findIndex(p => p.id === id)
                if (i !== -1) {
                    projects.value[i] = {
                        ...projects.value[i],
                        img: newImg,
                        image: newImg,
                    }
                }
            }
        }

        if (Object.keys(updates).length) {
            res = await api.put(`/projects/${id}`, updates)
            if (res.success) {
                const i = projects.value.findIndex(p => p.id === id)
                if (i !== -1) projects.value[i] = { ...projects.value[i], ...updates }
            }
        }

        if (res && !res.success) console.error('Project update failed', res.error)
        return res || { success: false, error: 'Nothing to update' }
    }

    // Deletes a project
    const removeProject = async id => {
        const res = await api.delete(`/projects/${id}`)
        if (res.success) projects.value = projects.value.filter(p => p.id !== id)
        else console.error('Project deletion failed', res.error)
        return res
    }

    // Project form configuration
    const projectFields = [
        { id: 'name', labelKey: 'projectName', placeholderKey: 'enterProjectName', type: 'text', required: true },
        { id: 'short_fr', labelKey: 'projectShortFr', placeholderKey: 'enterShortDescriptionFr', type: 'text', required: true },
        { id: 'short_en', labelKey: 'projectShortEn', placeholderKey: 'enterShortDescriptionEn', type: 'text', required: true },
        { id: 'img', labelKey: 'projectImage', placeholderKey: 'selectImage', type: 'file', accept: '.jpg,.jpeg,.png,.gif,.webp,.avif' },
        { id: 'link', labelKey: 'projectLink', placeholderKey: 'enterLink', type: 'text' },
        { id: 'skills', labelKey: 'projectSkills', placeholderKey: 'enterSkills', type: 'text' },
        { id: 'date', labelKey: 'projectDate', placeholderKey: 'enterDate', type: 'date' },
    ]

    return {
        projects,
        loading,
        search,
        filteredProjects,
        displayProjectName,
        displayProjectShort,
        displayValue,
        fetchProjects,
        addProject,
        updateProject,
        removeProject,
        projectFields,
    }
}