// Time "HH:MM" of a date
const clock = date => `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

/*
 * Availability of the moment, shown on the home page: 'available', 'busy' or 'unavailable'.
 * A holiday period wins, then the manual status of the admin, then the weekly schedule (in the time zone of the agenda).
 */
export const getAvailability = (periods, override, settings) => {
    if (!settings?.timezone) return 'unavailable'
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: settings.timezone }))

    const onHoliday = (periods || []).some(p => now >= new Date(`${p.startDate}T00:00:00`) && now <= new Date(`${p.endDate}T23:59:59`))
    if (onHoliday) return 'unavailable'
    if (override?.enabled) return override.status

    const slot = settings.schedule?.[now.getDay()]
    const time = clock(now)
    return slot && time >= slot.start && time <= slot.end ? 'available' : 'unavailable'
}
