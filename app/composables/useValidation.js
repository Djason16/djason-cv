import { useNuxtApp } from '#app'

export const useValidation = () => {
    const { $lang } = useNuxtApp()

    // Validate DD/MM/YYYY date format
    const isValidDate = (s) => {
        if (!s) return false
        const match = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
        if (!match) return false
        const [, d, m, y] = match.map(Number)
        const date = new Date(y, m - 1, d)
        return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    }

    // Validate numeric string
    const isValidNumber = (num) => /^\d+$/.test(num?.trim())

    // Prompt user with validation loop
    const promptWithValidation = (msgKey, validator, errorKey) => {
        while (true) {
            const input = prompt($lang.getTranslation(msgKey))
            if (input === null) return null
            if (!input.trim()) return ''
            if (validator(input)) return input.trim()
            alert($lang.getTranslation(errorKey))
        }
    }

    return { isValidDate, isValidNumber, promptWithValidation }
}