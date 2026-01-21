import { ref } from 'vue'

export const useDatabase = () => {
    const loading = ref(false)
    const error = ref(null)

    const replaceDatabase = async (file) => {
        loading.value = true
        error.value = null

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await $fetch('/api/database/replace-db', {
                method: 'POST',
                body: formData
            })

            // Wait for server to restart (3 seconds)
            await new Promise(resolve => setTimeout(resolve, 3000))

            // Reload the page to reconnect to the new server
            window.location.reload()

            return response
        } catch (err) {
            // If server is restarting, wait and reload anyway
            if (err.message?.includes('ENOENT') || err.message?.includes('fetch failed') || !err.statusCode) {
                console.log('Server restarting, waiting...')
                await new Promise(resolve => setTimeout(resolve, 3000))
                window.location.reload()
            } else {
                error.value = err
                console.error('Database replacement failed:', err)
                throw err
            }
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        error,
        replaceDatabase
    }
}