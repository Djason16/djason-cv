import { useNuxtApp } from '#app'
import { computed, ref } from 'vue'
import { projects as rawProjects } from '~/src/data/projectsData'

export const useProjects = () => {
    const { $lang } = useNuxtApp()
    const projects = ref([])
    const loading = ref(false)
    const search = ref('')

    // Normalize a project object
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
                    return $lang.current.value === 'english' ? this.short_en : this.short_fr
                }
                return $lang.getTranslation(this.shortKey)
            },
        }
    }

    // Determine display description based on language
    const displayProjectShort = p =>
        p?.short_fr && p?.short_en
            ? $lang.current.value === 'english'
                ? p.short_en
                : p.short_fr
            : $lang.getTranslation(p?.shortDescriptionKey)

    // Fetch projects from raw data and API
    const fetchProjects = async () => {
        loading.value = true
        try {
            const combined = rawProjects.map(normalizeProject).filter(Boolean)

            console.log('📦 Raw projects:', combined.map(p => ({ name: p.name, link: p.link, hasId: !!p.id })))

            try {
                const res = await $fetch('/api/projects')
                console.log('🌐 API response:', res)

                if (res?.projects?.length) {
                    const apiProjects = res.projects
                        .map(p => {
                            const proj = normalizeProject(p)

                            if (!proj) return null
                            if (typeof p.skills === 'string') {
                                try {
                                    proj.skills = JSON.parse(p.skills)
                                } catch {
                                    proj.skills = []
                                }
                            }
                            return proj
                        })
                        .filter(Boolean)

                    combined.push(...apiProjects)
                }
            } catch (e) {
                console.warn('API unreachable, using local data only', e)
            }

            console.log('🎯 Final combined projects:', combined.map(p => ({ name: p.name, link: p.link, id: p.id })))
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

    // Filter projects by search query
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

    // Convert project object to FormData
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

    // Add new project (API projects only)
    const addProject = async (project, imageFile = null) => {
        try {
            const res = await $fetch('/api/projects/add-project', {
                method: 'POST',
                body: createFormData(project, imageFile),
            })

            if (res.success) {
                const normalized = normalizeProject({
                    ...project,
                    id: res.projectId,
                    img: res.imagePath || project.img,
                })
                if (normalized) projects.value.unshift(normalized)
            }

            return res
        } catch (e) {
            console.error('Project creation failed', e)
            return { success: false, error: e.message }
        }
    }

    // Update existing project
    const updateProject = async (id, updates = {}, imageFile = null) => {
        try {
            let res

            if (imageFile) {
                res = await $fetch('/api/projects/update-project', {
                    method: 'POST',
                    body: createFormData({ id }, imageFile),
                })
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
                res = await $fetch('/api/projects/update-project', {
                    method: 'PUT',
                    body: JSON.stringify({ id, ...updates }),
                    headers: { 'Content-Type': 'application/json' },
                })
                if (res.success) {
                    const i = projects.value.findIndex(p => p.id === id)
                    if (i !== -1) projects.value[i] = { ...projects.value[i], ...updates }
                }
            }

            return res || { success: false, error: 'Nothing to update' }
        } catch (e) {
            console.error('Project update failed', e)
            return { success: false, error: e.message }
        }
    }

    // Delete a project
    const removeProject = async id => {
        try {
            const res = await $fetch('/api/projects/remove-project', {
                method: 'DELETE',
                body: { id },
            })
            if (res.success) projects.value = projects.value.filter(p => p.id !== id)
            return res
        } catch (e) {
            console.error('Project deletion failed', e)
            return { success: false, error: e.message }
        }
    }

    // Project form configuration
    const projectFields = [
        { id: 'name', labelKey: 'projectName', placeholderKey: 'enterProjectName', type: 'text', required: true },
        { id: 'short_fr', labelKey: 'projectShortFr', placeholderKey: 'enterShortDescriptionFr', type: 'text', required: true },
        { id: 'short_en', labelKey: 'projectShortEn', placeholderKey: 'enterShortDescriptionEn', type: 'text', required: true },
        { id: 'img', labelKey: 'projectImage', placeholderKey: 'selectImage', type: 'file', accept: 'image/*' },
        { id: 'link', labelKey: 'projectLink', placeholderKey: 'enterLink', type: 'text' },
        { id: 'skills', labelKey: 'projectSkills', placeholderKey: 'enterSkills', type: 'text' },
        { id: 'date', labelKey: 'projectDate', placeholderKey: 'enterDate', type: 'date' },
    ]

    return {
        $lang,
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