import { ref } from 'vue'
import { api } from '@/utils/api.js'

// Variables of the .env file in the admin page: read and update (GET / PUT /api/env), then reload once the server restarted
export const useEnv = () => {
    const envVars = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Wraps async calls with unified loading/error handling (failures are thrown for the modal)
    const run = async (fn) => {
        loading.value = true
        error.value = null
        try {
            return await fn()
        } catch (err) {
            error.value = err
            console.error('Environment request failed:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    // Fetches all environment variables
    const fetchEnvVars = () => run(async () => {
        const res = await api.get('/env')
        if (!res.success) throw new Error(res.error)
        envVars.value = res.env
        return res.env
    })

    // Updates environment variables, then reload once the server has restarted (development)
    const updateEnvVars = (updates) => run(async () => {
        const res = await api.put('/env', updates)

        // A 4xx is a refused update; a network failure means the server is already restarting
        if (!res.success && res.status >= 400 && res.status < 500) throw new Error(res.error)

        if (res.success && envVars.value) Object.assign(envVars.value, updates)

        // Waits for server to restart (3 seconds), then reload page to reconnect
        await new Promise(resolve => setTimeout(resolve, 3000))
        window.location.reload()
        return res
    })

    return {
        envVars,
        loading,
        error,
        fetchEnvVars,
        updateEnvVars
    }
}