import { developerSkills as developerSkillsRaw, videoEditorSkills as videoEditorSkillsRaw } from '~/src/data/skillsData.js'

// Return deep copies of developer and video editor skills
export const useSkills = () => ({
    developerSkills: developerSkillsRaw.map(skill => ({ ...skill })),
    videoEditorSkills: videoEditorSkillsRaw.map(skill => ({ ...skill }))
})