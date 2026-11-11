import { computed } from 'vue'
import { useLang } from './useLang'
import { skillGroups } from '@/data/skills'
import { api } from '@/utils/api'

/*
 * Skills of the home page: the ones of data/skills.js, then the ones added from the admin (/api/skills), in the same groups.
 * Also the list offered for the projects (their skills are free texts: one of this list or a new one).
 *   const { groups, customSkills, projectSkillOptions, fetchSkills, addSkill, updateSkill, removeSkill } = useSkills()
 */

// Skills of the first projects, stored as translation keys (plugins/translations/pages/index.js): still offered
const PROJECT_SKILL_KEYS = ['editing', 'vfx', 'compositing', 'tracking', 'motionDesign', 'threeDimensional', 'animation', 'vue', 'slimPHP',
    'nodejs', 'stripe', 'nuxt', 'nitro', 'docker', 'infomaniak', 'o2switch', 'git', 'github', 'responsive', 'figma', 'photoshop']

export const useSkills = () => {
    const lang = useLang()
    const t = lang.getTranslation
    // Skills of the API, as the API sends them (shared by every component)
    const customSkills = useState<Record<string, any>[]>('apiSkills', () => [])

    // Each group of data/skills.js with its added skills at the end (description in the current language)
    const groups = computed(() => skillGroups.map(group => ({
        ...group,
        skills: [
            ...group.skills,
            ...customSkills.value.filter(skill => skill.group_id === group.id).map(skill => ({
                name: skill.name,
                description: (lang.current.value === 'en' ? skill.description_en : skill.description_fr) || skill.description_fr || skill.description_en || '',
            })),
        ],
    })))

    // Choices for the skills of a project: the old keys (translated), then every skill of the home page, without twins
    const projectSkillOptions = computed(() => {
        const options = [
            ...PROJECT_SKILL_KEYS.map(key => ({ value: key, label: t(key) })),
            ...groups.value.flatMap(group => group.skills.map(skill => ({ value: skill.name, label: skill.name }))),
        ]
        const seen = new Set()
        return options.filter(option => {
            const id = option.label.toLowerCase()
            return seen.has(id) ? false : seen.add(id)
        })
    })

    const fetchSkills = async () => {
        const res = await api.get('/skills')
        if (res.success) customSkills.value = res.skills
        else console.warn('Skills of the API not loaded:', res.error)
    }

    const addSkill = async (skill: Record<string, any>) => {
        const res = await api.post('/skills', skill)
        if (res.success) customSkills.value = [...customSkills.value, res.skill]
        return res
    }

    const updateSkill = async (id: string, changes: Record<string, unknown>) => {
        const res = await api.put(`/skills/${id}`, changes)
        if (res.success) customSkills.value = customSkills.value.map(skill => skill.id === id ? { ...skill, ...changes } : skill)
        return res
    }

    const removeSkill = async (id: string) => {
        const res = await api.delete(`/skills/${id}`)
        if (res.success) customSkills.value = customSkills.value.filter(skill => skill.id !== id)
        return res
    }

    return { groups, customSkills, projectSkillOptions, fetchSkills, addSkill, updateSkill, removeSkill }
}
