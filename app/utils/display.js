// Small helpers shared by the admin tables

// Empty value shown as "-"
export const displayValue = value => value ?? '-'

// Today as YYYY-MM-DD (UTC), the format of the dates stored in the database
export const todayIso = () => new Date().toISOString().slice(0, 10)
