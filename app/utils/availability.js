import { personalInfo } from './personalInfo.js'

/* Resolve current availability
   Priority order: date range → manual override → working schedule */
export const getAvailability = () => {
    const now = new Date()

    // Date-based unavailability window
    if (personalInfo.unavailableRange) {
        const start = new Date(personalInfo.unavailableRange.start)
        const end = new Date(personalInfo.unavailableRange.end)
        end.setHours(23, 59, 59, 999)

        if (now >= start && now <= end) return 'unavailable'
    }

    // Explicit manual state
    if (personalInfo.manualOverride) return personalInfo.manualStatus

    // Timezone-aware schedule check
    try {
        const local = new Date(
            now.toLocaleString('en-US', { timeZone: personalInfo.workingHours.timezone })
        )

        const day = local.getDay()
        const time = `${String(local.getHours()).padStart(2, '0')}:${String(local.getMinutes()).padStart(2, '0')}`
        const slot = personalInfo.workingHours.schedule[day]

        return slot && time >= slot.start && time <= slot.end
            ? 'available'
            : 'unavailable'
    } catch (err) {
        console.error('Availability calculation failed:', err)
        return 'unavailable'
    }
}

/* Compute UTC offset (hours) for a given timezone */
const getUTCOffsetHours = tz => {
    const now = new Date()
    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const local = new Date(now.toLocaleString('en-US', { timeZone: tz }))
    return (local - utc) / 36e5
}

/* Build a readable working-hours string
   Mirrors availability rules while remaining user-facing */
export const getWorkingHours = translate => {
    const now = new Date()

    // Active date-based unavailability message
    if (personalInfo.unavailableRange) {
        const start = new Date(personalInfo.unavailableRange.start)
        const end = new Date(personalInfo.unavailableRange.end)
        end.setHours(23, 59, 59, 999)

        if (now >= start && now <= end) {
            const formatted = end.toLocaleDateString(translate('locale'), {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })
            return translate('unavailableUntil', { date: formatted })
        }
    }

    // Manual override message
    if (personalInfo.manualOverride) {
        return translate(
            personalInfo.manualStatus === 'busy'
                ? 'notAvailable'
                : personalInfo.manualStatus
        )
    }

    // Schedule formatting
    const schedule = personalInfo.workingHours.schedule
    const days = Object.keys(schedule)
    if (!days.length) return translate('noSchedule')

    const offsetHours = getUTCOffsetHours(personalInfo.workingHours.timezone)
    const offset = `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours} Paris`

    const first = schedule[days[0]]
    const uniform = days.every(d =>
        schedule[d].start === first.start &&
        schedule[d].end === first.end
    )

    if (uniform && days.length === 5) {
        return `${translate('mondayToFriday')} ${first.start}-${first.end} (${offset})`
    }

    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days
        .map(d => `${translate(dayKeys[d])} ${schedule[d].start}-${schedule[d].end} (${offset})`)
        .join(', ')
}