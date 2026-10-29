import { ref } from 'vue'
import { api } from '@/utils/api.js'

// Variables of the .env file in the admin page: read and update (GET / PUT /api/env), then reload once the server restarted
export const useEnv = () => {
    const envVars = ref(null)

    // Every KEY=value of the .env file (a failure is thrown for the modal)
    const fetchEnvVars = async () => {
        const res = await api.get('/env')
        if (!res.success) throw new Error(res.error)
        envVars.value = res.env
        return res.env
    }

    // Saves the changed values, then reloads the page once the server has restarted (development); onSaved = shown meanwhile
    const updateEnvVars = async (updates, onSaved) => {
        const res = await api.put('/env', updates)

        // A 4xx is a refused update; a network failure means the server is already restarting
        if (!res.success && res.status >= 400 && res.status < 500) throw new Error(res.error)
        if (res.success && envVars.value) Object.assign(envVars.value, updates)
        onSaved?.()

        await new Promise(resolve => setTimeout(resolve, 3000))
        window.location.reload()
        return res
    }

    return { envVars, fetchEnvVars, updateEnvVars }
}
