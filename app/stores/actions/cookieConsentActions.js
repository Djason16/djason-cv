const COOKIE_NAME = 'site_cookie_consent'
const EXPIRES_IN_DAYS = 180

// Read a cookie value by name
const getCookie = (name) => {
    if (!process.client) return null
    try {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop().split(';').shift()
    } catch (e) {
        console.error('Failed to read cookie:', e)
    }
    return null
}

// Write a cookie with an expiration date
const setCookie = (name, value, days) => {
    if (!process.client) return
    try {
        const expires = new Date(Date.now() + days * 864e5).toUTCString()
        document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/; SameSite=Strict`
    } catch (e) {
        console.error('Failed to set cookie:', e)
    }
}

export const cookieConsentActions = {
    // Load saved preferences from cookie on page load
    loadPreferences() {
        if (!process.client) return false
        const saved = getCookie(COOKIE_NAME)
        if (saved) {
            try {
                const parsed = JSON.parse(decodeURIComponent(saved))
                this.preferences = {
                    essential: true,
                    security: true,
                    payment: true,
                    functional: parsed.functional ?? false
                }
                this.hasUserMadeChoice = true
                if (process.env.NODE_ENV === 'development') console.log('✅ Cookie preferences loaded:', this.preferences)
                return true
            } catch (e) {
                console.error('❌ Failed to parse cookie consent:', e)
                this.resetPreferences()
            }
        }
        return false
    },

    // Save preferences to cookie and update store state
    savePreferences(prefs) {
        if (!process.client) return
        const sanitized = {
            essential: true,
            security: true,
            payment: true,
            functional: prefs?.functional ?? false
        }
        this.preferences = sanitized
        setCookie(COOKIE_NAME, sanitized, EXPIRES_IN_DAYS)
        this.hasUserMadeChoice = true
        if (process.env.NODE_ENV === 'development') console.log('💾 Cookie preferences saved:', sanitized)
    },

    // Accept all cookies including optional ones
    acceptAll() {
        if (!process.client) return
        this.savePreferences({ essential: true, security: true, payment: true, functional: true })
        if (process.env.NODE_ENV === 'development') console.log('✅ All cookies accepted')
    },

    // Deny optional cookies and keep only required ones
    denyAll() {
        if (!process.client) return
        this.savePreferences({ essential: true, security: true, payment: true, functional: false })
        if (process.env.NODE_ENV === 'development') console.log('❌ Optional cookies denied')
    },

    // Alias for denyAll to ensure compatibility
    rejectAll() {
        this.denyAll()
    },

    // Reset preferences to default state without saving
    resetPreferences() {
        this.hasUserMadeChoice = false
        this.preferences = { essential: true, security: true, payment: true, functional: false }
        if (process.env.NODE_ENV === 'development') console.log('🔄 Cookie preferences reset to default')
    },

    // Delete the consent cookie and reset store state
    deleteCookie() {
        if (!process.client) return
        try {
            document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`
            this.resetPreferences()
            if (process.env.NODE_ENV === 'development') console.log('🗑️ Cookie consent deleted')
        } catch (e) {
            console.error('Failed to delete cookie:', e)
        }
    }
}