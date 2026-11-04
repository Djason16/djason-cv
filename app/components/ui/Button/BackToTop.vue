<template>
    <!-- Floating button back to the top of the page, shown once the visitor scrolled down;
         with "end": down to the bottom of the page, shown while the bottom is still far -->
    <FloatingButton :show="isVisible" class="floating-btn--fold" :aria-label="t(end ? 'backToEnd' : 'backToTop')" @click="go">
        <i :class="['fa-solid', end ? 'fa-arrow-down' : 'fa-arrow-up']" aria-hidden="true" />
    </FloatingButton>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { onMounted, onUnmounted, ref } from 'vue'
import FloatingButton from '@/components/ui/Button/FloatingButton.vue'

const props = defineProps({
    end: { type: Boolean, default: false }
})

const { getTranslation: t } = useLang()

const isVisible = ref(false)

// Distance in px past which the button is shown (from the top, or from the bottom with "end")
const SHOWN_PAST = 200

// Smooth scroll to the top or to the bottom of the page
const go = () => window.scrollTo({ top: props.end ? document.documentElement.scrollHeight : 0, behavior: 'smooth' })

const update = () => {
    const toBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
    isVisible.value = props.end ? toBottom > SHOWN_PAST : window.scrollY > SHOWN_PAST
}

// Checked at once, then on every scroll and resize (the page gets longer while its images load)
onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
})
onUnmounted(() => {
    window.removeEventListener('scroll', update)
    window.removeEventListener('resize', update)
})
</script>
