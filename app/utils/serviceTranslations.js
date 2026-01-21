export const serviceTranslations = {
    'Video Editing (VFX)': 'videoEditing',
    'Custom Web Development': 'webDevelopment',
    'IT Repair & Consulting': 'computerRepair',
    'Corporate Mission': 'corporateMission',
    'Other': 'other'
}

export const getServiceTranslationKey = (serviceName) => {
    if (!serviceName) return 'other'
    const lower = serviceName.toLowerCase()
    if (lower.includes('video')) return 'videoEditing'
    if (lower.includes('web')) return 'webDevelopment'
    if (lower.includes('repair')) return 'computerRepair'
    if (lower.includes('corporate')) return 'corporateMission'
    return 'other'
}