// Translation key of a service name stored in the database ('Video Editing (VFX)' -> videoEditing)
const serviceTranslations = {
    'Video Editing (VFX)': 'videoEditing',
    'Custom Web Development': 'webDevelopment',
    'IT Repair & Consulting': 'computerRepair',
    'Corporate Mission': 'corporateMission',
    'Other': 'other'
}

// Translation key of a service name stored in the database
const getServiceTranslationKey = (serviceName) => {
    if (!serviceName) return 'other'
    const lower = serviceName.toLowerCase()
    if (lower.includes('video')) return 'videoEditing'
    if (lower.includes('web')) return 'webDevelopment'
    if (lower.includes('repair')) return 'computerRepair'
    if (lower.includes('corporate')) return 'corporateMission'
    return 'other'
}

// Name of a service in the current language ("t" = lang.getTranslation), the stored name when no text exists
export const translateServiceName = (name, t) => {
    if (!name) return ''
    const key = serviceTranslations[name] || getServiceTranslationKey(name)
    const text = t(key)
    return text !== key ? text : name
}
