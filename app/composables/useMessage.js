import { computed, ref } from 'vue'
import { useLang } from './useLang.js'

// Feedback message of a form (MessageBox): showMessage('error', 'invalidOtp'), translated in the current language
export const useMessage = () => {
    const lang = useLang()
    const message = ref(null)

    // { type, key } for MessageBox, the key already translated (and translated again on language change)
    const translatedMessage = computed(() =>
        message.value ? { type: message.value.type, key: lang.getTranslation(message.value.key) } : null
    )

    // Displays a message; success messages disappear after autoClearDelay milliseconds (0 = stay)
    const showMessage = (type, key, autoClearDelay = 5000) => {
        message.value = { type, key: typeof key === 'string' ? key : 'unknownMessage' }
        if (type === 'success' && autoClearDelay > 0) setTimeout(() => { message.value = null }, autoClearDelay)
    }

    const clearMessage = () => { message.value = null }

    return { translatedMessage, showMessage, clearMessage }
}
