import { toRaw } from 'vue'

// Converts a timezone string to UTC offset in hours
const getUTCOffsetHours = tz => {
    try {
        const now = new Date()
        const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
        const local = new Date(now.toLocaleString('en-US', { timeZone: tz }))
        return (local - utc) / 36e5
    } catch {
        return 0
    }
}

// Determines current availability based on periods, manual override, and schedule
export const getAvailability = (periodsData, overrideData, settingsData) => {
    const rawPeriods = periodsData ? toRaw(periodsData) : []
    const rawOverride = overrideData ? toRaw(overrideData) : null
    const rawSettings = settingsData ? toRaw(settingsData) : null
    if (!rawSettings?.timezone) return 'unavailable'

    const now = new Date()
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: rawSettings.timezone }))

    // Checks if currently in an unavailability period
    if (rawPeriods.find(p => {
        const start = new Date(`${p.startDate}T00:00:00`)
        const end = new Date(`${p.endDate}T23:59:59`)
        return localNow >= start && localNow <= end
    })) return 'unavailable'

    // Manual override takes precedence
    if (rawOverride?.enabled) return rawOverride.status

    // Checks regular schedule
    const day = localNow.getDay()
    const time = `${String(localNow.getHours()).padStart(2, '0')}:${String(localNow.getMinutes()).padStart(2, '0')}`
    const slot = rawSettings.schedule?.[day]
    if (!slot) return 'unavailable'
    return time >= slot.start && time <= slot.end ? 'available' : 'unavailable'
}

// Formats the weekly schedule into a human-readable string (used both for the normal case and the "busy" override case)
const formatScheduleText = (translate, schedule, timezone) => {
    if (!schedule) return translate('noSchedule')

    const offset = `UTC${getUTCOffsetHours(timezone) >= 0 ? '+' : ''}${getUTCOffsetHours(timezone)}`
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const days = Object.keys(schedule).map(Number).sort((a, b) => a - b)
    if (!days.length) return translate('noSchedule')

    // If all days have identical slots
    const firstSlot = schedule[days[0]]
    if (days.length === 7 && days.every(d => schedule[d].start === firstSlot.start && schedule[d].end === firstSlot.end))
        return `${translate('allDays')} ${firstSlot.start}-${firstSlot.end} (${offset})`

    // Builds readable day ranges
    const ranges = []
    let start = days[0], end = days[0]
    for (let i = 1; i <= days.length; i++) {
        const curr = days[i]
        if (curr != null && schedule[curr].start === schedule[end].start && schedule[curr].end === schedule[end].end && curr === end + 1) {
            end = curr
        } else {
            ranges.push({ start, end, slot: schedule[start] })
            start = curr
            end = curr
        }
    }

    return ranges.map(r => {
        const label = r.start === r.end
            ? translate(dayKeys[r.start])
            : translate('dayRange', { start: translate(dayKeys[r.start]), end: translate(dayKeys[r.end]) })
        return `${label} ${r.slot.start}-${r.slot.end} (${offset})`
    }).join(', ')
}

// Generates human-readable schedule string including timezone and unavailability
export const getWorkingHours = (translate, periodsData, overrideData, settingsData, locale = 'fr-FR') => {
    const rawPeriods = periodsData ? toRaw(periodsData) : []
    const rawOverride = overrideData ? toRaw(overrideData) : null
    const rawSettings = settingsData ? toRaw(settingsData) : null
    if (!rawSettings?.timezone) return translate('noSchedule')

    const now = new Date()
    const localNow = new Date(now.toLocaleString('en-US', { timeZone: rawSettings.timezone }))

    // Shows active unavailability period
    const activePeriod = rawPeriods.find(p => {
        const start = new Date(`${p.startDate}T00:00:00`)
        const end = new Date(`${p.endDate}T23:59:59`)
        return localNow >= start && localNow <= end
    })
    if (activePeriod) {
        const formatted = new Date(activePeriod.endDate).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
        return translate('unavailableUntil', { date: formatted })
    }

    // Manual override: "busy" still shows the regular schedule (you're not away, just slower to respond),
    // while "available"/"unavailable" keep showing just the plain status label
    if (rawOverride?.enabled) {
        if (rawOverride.status === 'busy') return formatScheduleText(translate, rawSettings.schedule, rawSettings.timezone)
        return translate(rawOverride.status)
    }

    // Formats schedule
    return formatScheduleText(translate, rawSettings.schedule, rawSettings.timezone)
}
