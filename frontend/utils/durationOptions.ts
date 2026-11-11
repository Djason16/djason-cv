// Durations of a mission that can be picked: 5min to 12h, in 5min steps
const buildDurationOptions = () => {
    const opts = []

    // Adds durations under 1 hour
    for (let m = 5; m <= 55; m += 5)
        opts.push({ value: (m / 60).toFixed(2), label: `${m}min` })

    // Adds durations from 1h to 12h (in 5min increments)
    for (let h = 1; h <= 12; h++) {
        for (let m = 0; m < 60; m += 5) {
            const t = h + m / 60
            if (t > 12) break
            opts.push({
                value: t.toFixed(2),
                label: m === 0 ? `${h}h` : `${h}h${m.toString().padStart(2, '0')}`
            })
        }
    }

    return opts
}

export const DURATION_OPTIONS = buildDurationOptions()
