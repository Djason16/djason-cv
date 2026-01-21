import { ref } from 'vue'
import { useTranslatedMessage } from '~/composables/useTranslatedMessage'

export const useMessage = () => {
    const errorMessage = ref(null)
    const { translatedMessage } = useTranslatedMessage(errorMessage)

    // Display a message; auto-clear success messages after a delay
    const showMessage = (type, key, autoClearDelay = 5000) => {
        errorMessage.value = { type, key: typeof key === 'string' ? key : 'unknownMessage' }
        if (type === 'success' && autoClearDelay > 0)
            setTimeout(() => errorMessage.value = null, autoClearDelay)
    }

    // Clear the current message
    const clearMessage = () => { errorMessage.value = null }

    return { errorMessage, translatedMessage, showMessage, clearMessage }
}
