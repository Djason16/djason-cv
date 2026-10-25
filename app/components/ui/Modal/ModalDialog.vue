<template>
    <!-- Modal that grows from the button that opened it; TableModal and FormModal are built on it -->
    <Teleport to="body">
        <transition name="morph" @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter" @leave="leave">
            <div v-if="show" ref="modalEl" class="morph-modal" tabindex="-1" @click.self="close">
                <div class="modal-inner">
                    <header class="modal-header">
                        <h3 class="text-large text-bold">{{ title }}</h3>
                        <button class="close-btn" @click="close" :title="t('close')"
                            :aria-label="t('close')">
                            <i class="fas fa-times"></i>
                        </button>
                    </header>
                    <div class="modal-body">
                        <slot />
                    </div>
                    <footer v-if="$slots.footer" class="morph-modal__footer">
                        <slot name="footer" />
                    </footer>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'

const { getTranslation: t } = useLang()

const props = defineProps({
    show: Boolean,
    title: { type: String, default: '' },
    position: Object,
    activeButton: Object
})
const emit = defineEmits(['close'])
const modalEl = ref(null)
const close = () => emit('close')

// Locks scroll & focuses modal on open
watch(() => props.show, async v => {
    document.body.classList.toggle('modal-open', v)
    if (v) await nextTick(() => modalEl.value?.focus()), document.body.classList.remove('modal-closing')
    else document.body.classList.add('modal-closing'), setTimeout(() => document.body.classList.remove('modal-closing'), 400)
})

// Closes on Escape
const onKeyDown = e => e.key === 'Escape' && props.show && close()
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

// Animates from trigger or center
const beforeEnter = el => {
    const { top = innerHeight / 2, left = innerWidth / 2, size = 0 } = props.position || {}
    Object.assign(el.style, {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        opacity: '0',
        padding: '0',
        transform: 'translate(-50%, -50%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        willChange: 'transform, width, height, border-radius, opacity'
    })
}

// Animates to final size
const enter = (el, done) => {
    el.offsetHeight
    const isMobile = innerWidth <= 1024
    Object.assign(el.style, {
        transition: 'all 0.4s ease',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: isMobile ? '75vw' : 'fit-content',
        height: isMobile ? 'auto' : 'fit-content',
        minHeight: isMobile ? '50vh' : '',
        maxWidth: !isMobile ? '90vw' : '',
        maxHeight: '90vh',
        borderRadius: '12px',
        opacity: '1',
        padding: isMobile ? '1.5rem' : '2rem',
        justifyContent: 'center',
        alignItems: 'center'
    })
    const inner = el.querySelector('.modal-inner')
    if (inner) inner.style.opacity = '1'
    setTimeout(() => { el.style.willChange = 'auto'; done() }, 400)
}
const afterEnter = el => el.style.transition = ''

// Animates closing back to trigger
const leave = (el, done) => {
    if (!props.activeButton) return setTimeout(done, 0)
    const rect = props.activeButton.getBoundingClientRect()
    const inner = el.querySelector('.modal-inner')
    if (inner) inner.style.opacity = '0'
    Object.assign(el.style, {
        transition: 'all 0.4s ease',
        top: `${rect.top + rect.height / 2}px`,
        left: `${rect.left + rect.width / 2}px`,
        width: `${rect.width}px`, height: `${rect.width}px`,
        borderRadius: '50%', opacity: '0', padding: '0', transform: 'translate(-50%,-50%)', willChange: 'top,left,width,height,opacity,border-radius'
    })
    setTimeout(() => { el.style.willChange = 'auto'; done() }, 400)
}
</script>
