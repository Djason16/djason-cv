import { reactive, ref } from 'vue'

// Unified composable for single or multiple image fallbacks
export const useImageFallback = (multiple = false) => {
    if (multiple) {
        const fallbacks = reactive({})
        const onError = index => { fallbacks[index] = true }
        const onImgError = src => { }
        return { fallbacks, onError, onImgError }
    } else {
        const fallback = ref(false)
        const onError = () => { fallback.value = true }
        const onImgError = src => { }
        return { fallback, onError, onImgError }
    }
}