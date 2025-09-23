import { projects as rawProjects } from '~/src/data/projectsData'

// Returns projects with selected fields, sorted by newest first
export const useProjects = () =>
    rawProjects
        .map(p => ({
            name: p.name,
            shortDescriptionKey: p.short, // key for short description
            image: p.img,
            link: p.link,
            skills: p.skills,
            date: p.date
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date))
