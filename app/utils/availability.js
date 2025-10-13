import { personalInfo } from './personalInfo.js'

// Get current availability considering manual override or schedule
export const getAvailability = () => {
    if (personalInfo.manualOverride) return personalInfo.manualStatus

    try {
        const now = new Date()
        const local = new Date(now.toLocaleString('en-US', { timeZone: personalInfo.workingHours.timezone }))
        const day = local.getDay()
        const time = `${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`
        const schedule = personalInfo.workingHours.schedule[day]
        return schedule && time >= schedule.start && time <= schedule.end ? 'available' : 'unavailable'
    } catch (err) {
        console.error('Availability calculation failed:', err)
        return 'unavailable'
    }
}

// Compute current UTC offset for a timezone in hours
const getUTCOffsetHours = tz => {
    const now = new Date()
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }))
    return (tzDate - utcDate) / (1000 * 60 * 60)
}

// Generate readable working hours string, respecting manual override
export const getWorkingHours = translate => {
    if (personalInfo.manualOverride)
        return translate(personalInfo.manualStatus === 'busy' ? 'notAvailable' : personalInfo.manualStatus)

    const schedule = personalInfo.workingHours.schedule
    const days = Object.keys(schedule)
    if (!days.length) return translate('noSchedule')

    const offset = `UTC${getUTCOffsetHours(personalInfo.workingHours.timezone) >= 0 ? '+' : ''}${getUTCOffsetHours(personalInfo.workingHours.timezone)} Paris`
    const first = schedule[days[0]]
    const allSame = days.every(d => schedule[d].start === first.start && schedule[d].end === first.end)

    if (allSame && days.length === 5) return `${translate('mondayToFriday')} ${first.start}-${first.end} (${offset})`

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days.map(d => `${translate(dayNames[d])} ${schedule[d].start}-${schedule[d].end} (${offset})`).join(', ')
}