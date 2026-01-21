// ==========================
// SERVICES CONFIGURATION
// ==========================

// Helper to generate sections array from parallel title/content keys
const generateSections = (titles, contents) =>
    titles.map((titleKey, i) => ({ titleKey, contentKey: contents[i] }));

export const services = [
    // Video Editor Services
    // Services related to video editing and post-production, showcasing creativity and technical expertise.
    // Sections include:
    // - Creative Editing: Combining ideas to create compelling content.
    // - Advanced VFX: Adding visual effects to enhance projects.
    // - Technical Post-Production: Optimizing videos for the best results.
    // - Creative Impact: Delivering memorable visuals for effective storytelling.
    {
        titleKey: "videoEditor",
        icon: "fa-solid fa-film",
        introKey: "passionateAudiovisual",
        sections: generateSections(
            [
                "creativeEditingTitle",
                "advancedVFXTitle",
                "technicalPostProductionTitle",
                "creativeImpactTitle"
            ],
            [
                "creativeEditing",
                "advancedVFX",
                "technicalPostProduction",
                "creativeImpact"
            ]
        ),
        addedValueKey: "addedValueVideo",
    },

    // Fullstack Developer Services
    // Comprehensive web development services to create functional and visually appealing websites.
    // Sections include:
    // - Website Creation: Building adaptable and high-performing websites.
    // - Website Optimization: Enhancing site speed and usability.
    // - Secure Hosting: Providing reliable and secure hosting solutions.
    // - High-Performance SEO: Improving online visibility with advanced SEO techniques.
    {
        titleKey: "fullstackDeveloper",
        icon: "fa-solid fa-code",
        introKey: "customDigitalSolutions",
        sections: generateSections(
            [
                "websiteCreationTitle",
                "websiteOptimizationTitle",
                "secureHostingTitle",
                "topSEOTitle"
            ],
            [
                "websiteCreation",
                "websiteOptimization",
                "secureHosting",
                "topSEO"
            ]
        ),
        addedValueKey: "addedValueDev",
    },

    // Repair and Consulting Services
    // Technical support and IT consulting to resolve issues and improve system performance.
    // Sections include:
    // - Diagnostics and Repair: Quick solutions for technical problems.
    // - Performance Optimization: Boosting system efficiency and speed.
    // - Personalized Advice: Tailored recommendations for specific needs.
    // - Reliable Systems: Providing robust and dependable solutions.
    {
        titleKey: "repairAndConsulting",
        icon: "fa-solid fa-tools",
        introKey: "solidTechnicalSkills",
        sections: generateSections(
            [
                "diagnosticsRepairTitle",
                "performanceOptimizationTitle",
                "personalizedAdviceTitle",
                "reliableSystemsTitle"
            ],
            [
                "diagnosticsRepair",
                "performanceOptimization",
                "personalizedAdvice",
                "reliableSystems"
            ]
        ),
        addedValueKey: "addedValueConsulting",
    },
];