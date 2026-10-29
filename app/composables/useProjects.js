import { computed } from 'vue'
import { useLang } from './useLang.js'
import { projects as staticProjects } from '@/data/projects.js'
import { api } from '@/utils/api.js'
import { todayIso } from '@/utils/display.js'

/*
 * Projects of the home page: static ones (data/projects.js) and the ones added from the admin page (/api/projects).
 * The list of the API is shared by every component (useState): the home page loads it on the server (pre-rendered HTML)
 * and again in the browser (LastProject.vue), the admin loads it when its modal opens.
 */
export const useProjects = () => {
    const lang = useLang()
    // Projects of the API, as the API sends them
    const apiProjects = useState('apiProjects', () => [])

    // Same shape for both kinds; images of the API are served by /api/upload
    const normalize = (p, fromApi) => ({
        id: p.id ?? p.name,
        name: p.name || '',
        img: fromApi && p.img ? `api${p.img}` : p.img || '',
        link: p.link || null,
        skills: Array.isArray(p.skills) ? p.skills : [],
        date: p.date || todayIso(),
        short_fr: fromApi ? p.short_fr : null,
        short_en: fromApi ? p.short_en : null,
        // Short description in the current language (static projects: a translation key)
        short: fromApi ? (lang.current.value === 'en' ? p.short_en : p.short_fr) : lang.getTranslation(p.short || ''),
    })

    // Every project, most recent first
    const projects = computed(() => [
        ...staticProjects.map(p => normalize(p, false)),
        ...apiProjects.value.map(p => normalize(p, true)),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)))

    // Projects of the API (the static ones stay when the API cannot be reached)
    const fetchProjects = async () => {
        const res = await api.get('/projects')
        if (res.success) apiProjects.value = res.projects
        else console.warn('Projects of the API not loaded:', res.error)
    }

    // Project -> form data sent to the API (with its image file)
    const createFormData = (project, imageFile = null) => {
        const fd = new FormData()
        ;['id', 'name', 'short_fr', 'short_en', 'link', 'date'].forEach(k => project[k] && fd.append(k, project[k]))
        if (project.skills) fd.append('skills', Array.isArray(project.skills) ? JSON.stringify(project.skills) : project.skills)
        if (imageFile) fd.append('image', imageFile)
        return fd
    }

    // Changes a project of the local list (no new request)
    const patch = (id, changes) => {
        apiProjects.value = apiProjects.value.map(p => p.id === id ? { ...p, ...changes } : p)
    }

    // Adds a project from the admin page
    const addProject = async (project, imageFile = null) => {
        const res = await api.post('/projects', createFormData(project, imageFile))
        if (res.success) apiProjects.value = [...apiProjects.value, { ...project, id: res.id, img: res.imagePath || project.img }]
        else console.error('Project creation failed', res.error)
        return res
    }

    // Saves a new image and / or changed fields of a project
    const updateProject = async (id, updates = {}, imageFile = null) => {
        let res = { success: false, error: 'Nothing to update' }
        if (imageFile) {
            res = await api.post(`/projects/${id}/image`, createFormData({}, imageFile))
            if (res.success) patch(id, { img: res.imagePath })
        }
        if (Object.keys(updates).length) {
            res = await api.put(`/projects/${id}`, updates)
            if (res.success) patch(id, updates)
        }
        if (!res.success) console.error('Project update failed', res.error)
        return res
    }

    // Deletes a project
    const removeProject = async id => {
        const res = await api.delete(`/projects/${id}`)
        if (res.success) apiProjects.value = apiProjects.value.filter(p => p.id !== id)
        else console.error('Project deletion failed', res.error)
        return res
    }

    // Fields of the creation form
    const projectFields = [
        { id: 'name', labelKey: 'projectName', placeholderKey: 'enterProjectName', type: 'text', required: true },
        { id: 'short_fr', labelKey: 'projectShortFr', placeholderKey: 'enterShortDescriptionFr', type: 'text', required: true },
        { id: 'short_en', labelKey: 'projectShortEn', placeholderKey: 'enterShortDescriptionEn', type: 'text', required: true },
        { id: 'img', labelKey: 'projectImage', placeholderKey: 'selectImage', type: 'file', accept: '.jpg,.jpeg,.png,.gif,.webp,.avif' },
        { id: 'link', labelKey: 'projectLink', placeholderKey: 'enterLink', type: 'text' },
        { id: 'skills', labelKey: 'projectSkills', placeholderKey: 'enterSkills', type: 'text' },
        { id: 'date', labelKey: 'projectDate', placeholderKey: 'enterDate', type: 'date' },
    ]

    return { projects, fetchProjects, addProject, updateProject, removeProject, projectFields }
}
