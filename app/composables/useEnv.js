import { ref } from 'vue'

export const useEnv = () => {
    const envVars = ref(null)
    const loading = ref(false)
    const error = ref(null)

    // Wrap async calls with unified loading/error handling
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

    // Fetch all environment variables
    const fetchEnvVars = () => run(async () => {
        const res = await $fetch('/api/env')
        envVars.value = res
        return res
    })

    // Update environment variables with server restart handling
    const updateEnvVars = (updates) => run(async () => {
        try {
            const res = await $fetch('/api/env', {
                method: 'PUT',
                body: updates
            })

            // Update local state with new values
            if (envVars.value) {
                Object.assign(envVars.value, updates)
            }

            // Wait for server to restart (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Reload page to reconnect after restart
            window.location.reload()

            return res
        } catch (err) {
            // If server is restarting, wait and reload
            if (err.message?.includes('ENOENT') || err.message?.includes('fetch failed') || !err.statusCode) {
                console.log('Server restarting, reloading page...')
                await new Promise(resolve => setTimeout(resolve, 3000))
                window.location.reload()
            } else {
                throw err
            }
        }
    })

    return {
        envVars,
        loading,
        error,
        fetchEnvVars,
        updateEnvVars
    }
}