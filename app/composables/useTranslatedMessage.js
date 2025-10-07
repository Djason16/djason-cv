import { computed } from 'vue'
import { useNuxtApp } from '#app'

export const useTranslatedMessage = messageRef => {
    const { $lang } = useNuxtApp()
    const translatedMessage = computed(() =>
        messageRef.value
            ? { type: messageRef.value.type, key: $lang.getTranslation(messageRef.value.key) }
            : null
    )
    return { translatedMessage }
}
