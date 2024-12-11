// ==========================
// PROJECTS CONFIGURATION
// ==========================
export const projects = [
    // Djason Chery - Portfolio
    // Description: Showcase of personal skills and projects, including the development of this portfolio site.
    // Skills Used: Nuxt.js, Node.js, Infomaniak hosting, GitHub for version control, responsive design, and tools like Figma and Photoshop.
    // Date: December 5, 2024.
    {
        name: "Djason Chery - Portfolio",
        shortDescriptionKey: "djasonCheryShort",
        image: "images/banner_portfolio.jpg",
        skills: ["nuxt", "nodejs", "infomaniak", "github", "responsive", "figma", "photoshop"],
        date: "2024-12-05",
    },

    // Splash Auto BM
    // Description: Development of a website for an automotive specialist, integrating Stripe for payments.
    // Skills Used: Vue.js, Slim PHP for backend, Stripe payment integration, o2switch hosting, Git/GitHub for versioning, and responsive design.
    // Link: https://splashauto-bm.fr/
    // Date: September 13, 2024.
    {
        name: "Splash Auto BM",
        shortDescriptionKey: "splashAutoShort",
        image: "images/banner_splash_auto_bm.jpg",
        skills: ["vue", "slimPHP", "stripe", "o2switch", "git", "github", "responsive"],
        link: "https://splashauto-bm.fr/",
        date: "2024-09-13",
    },

    // L'Effondrement - Canal+
    // Description: Post-production work for the Canal+ series "L'Effondrement".
    // Skills Used: Video editing, visual effects (VFX), compositing, and tracking for seamless visual integration.
    // Link: https://www.canalplus.com/series/l-effondrement/h/12670812_50001
    // Date: November 11, 2019.
    {
        name: "L'Effondrement - Canal+",
        shortDescriptionKey: "effondrementShort",
        image: "images/banner_l'effondrement.jpg",
        skills: ["editing", "vfx", "compositing", "tracking"],
        link: "https://www.canalplus.com/series/l-effondrement/h/12670812_50001",
        date: "2019-11-11",
    },

    // ST IC 20: VOID - Promo
    // Description: Promotional video for the 20th Iron Chef competition of the Soul's Team, showcasing advanced editing and motion graphics.
    // Skills Used: Video editing, VFX, compositing, motion design, 3D animations, and creative storytelling.
    // Link: https://www.youtube.com/watch?v=dT3SwFnHxIY
    // Date: February 6, 2024.
    {
        name: "ST IC 20: VOID - Promo",
        shortDescriptionKey: "promoSTICShort",
        image: "images/banner_promoSTIC.jpg",
        skills: ["editing", "vfx", "compositing", "motionDesign", "threeDimensional", "animation"],
        link: "https://www.youtube.com/watch?v=dT3SwFnHxIY",
        date: "2024-02-06",
    }
].sort((a, b) => new Date(b.date) - new Date(a.date));