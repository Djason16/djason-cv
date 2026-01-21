import { useNuxtApp } from '#app'
import { computed } from 'vue'

// Return a reactive object translating a message ref on-the-fly
export const useTranslatedMessage = messageRef => {
    const { $lang } = useNuxtApp()
    const translatedMessage = computed(() =>
        messageRef.value
            ? { type: messageRef.value.type, key: $lang.getTranslation(messageRef.value.key) }
            : null
    )
    return { translatedMessage }
}
