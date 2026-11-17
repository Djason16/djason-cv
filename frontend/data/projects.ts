// Static projects of the home page grid (composables/useProjects.js adds the ones created from the admin page)
export const projects = [
    // Djason Chery - Portfolio
    {
        name: "Djason Chery - Portfolio",
        short: "djasonCheryShort",
        img: "images/banner_portfolio.webp",
        // Square copies for the card of the home page grid (srcset, like the photos sent from the admin)
        squares: { 320: "images/banner_portfolio-320.webp", 640: "images/banner_portfolio-640.webp" },
        skills: ["nuxt", "nitro", "TypeScript", "Pinia", "MySQL", "stripe", "WebRTC", "Google APIs", "docker", "infomaniak", "Playwright", "Lighthouse", "responsive", "figma", "photoshop", "git", "github"],
        date: "2024-12-05",
    },
];