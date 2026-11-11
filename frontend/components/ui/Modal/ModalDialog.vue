<template>
    <!-- Modal that grows from the button that opened it; TableModal, FormModal and ProjectModal are built on it -->
    <Teleport to="body">
        <transition :css="false" @enter="enter" @leave="leave">
            <div v-if="show" ref="modalEl" class="morph-modal" :class="{ 'morph-modal--flush': flush }" tabindex="-1"
                role="dialog" aria-modal="true" :aria-label="title" @click.self="close">
                <div class="modal-inner">
                    <!-- Flush: no title bar (the content shows its own title), the close button floats over the corner -->
                    <header class="modal-header">
                        <h3 v-if="!flush" class="text-display-s">{{ title }}</h3>
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

<script setup lang="ts">
import { useLang } from '@/composables/useLang'
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { motionEase, motionMs } from '@/utils/motion'
import { freeIfNoModal, modalClosed, modalOpened, openModals } from '@/utils/modalStack'

const { getTranslation: t } = useLang()

const props = defineProps({
    show: Boolean,
    title: { type: String, default: '' },
    activeButton: Object,
    // Content to the edges (a photo), no title bar
    flush: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])
const modalEl = ref<HTMLElement | null>(null)
const close = () => emit('close')

// Lengths of the animations: the --motion-* variables of the site, also used by the backdrop fade of global.css
const OPEN_MS = () => motionMs('base')
const CLOSE_MS = () => motionMs('fast')

// Open: the page behind stops scrolling, its scrollbar kept (utils/modalStack.js, shared by every modal), and the modal
// gets the focus. The backdrop (global.css) fades out only when the last open modal closes: going from one modal to
// another keeps it.
// Each modal knows whether it is counted, so it is counted once and always let go (even when removed while open)
let counted = false
const opened = () => {
    if (counted) return
    counted = true
    modalOpened()
    document.body.classList.add('modal-open')
    document.body.classList.remove('modal-closing')
}
const closed = () => {
    if (!counted) return
    counted = false
    modalClosed()
    if (openModals()) return
    document.body.classList.remove('modal-open')
    document.body.classList.add('modal-closing')
    setTimeout(() => {
        if (!openModals()) document.body.classList.remove('modal-closing')
        // Safety: nothing may stay locked (nor dark) once no modal is on the screen
        freeIfNoModal()
    }, CLOSE_MS() + 150)
}
watch(() => props.show, v => {
    // The focus without a scroll: the page stays where it was (the modal grows from its button, anywhere on the page)
    if (v) opened(), nextTick(() => modalEl.value?.focus({ preventScroll: true }))
    else closed()
})
// Mounted already open, or removed while open
onMounted(() => props.show && opened())
onUnmounted(closed)

// Closes on Escape, and on a click or a tap outside it (the dark backdrop): only the modal on top, never with the
// click that just opened it (listened to a moment after the opening). Pointer events, not "click": an iPhone sends no
// click for a tap on something that is not clickable (the backdrop); a finger that moved (a scroll) does not close
const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && props.show && close()
const isOnTop = () => {
    const all = document.querySelectorAll('.morph-modal')
    return modalEl.value && all[all.length - 1] === modalEl.value && !document.querySelector('.app-dialog')
}
// Layers shown over the modals (a question, a message, the cookie banner): a tap on them never closes a modal
const OVER_MODALS = ['app-dialog', 'app-toasts', 'cookie-banner']
// The path of the event as it was when it happened: a button it removes (a deleted row) still counts as inside
const isOutside = (e: Event) => {
    const path = e.composedPath()
    return !path.includes(modalEl.value as EventTarget) && !path.some(el => OVER_MODALS.some(c => (el as Element).classList?.contains(c)))
}
let press: { x: number, y: number } | null = null
const onDown = (e: MouseEvent) => { press = props.show && isOnTop() && isOutside(e) ? { x: e.clientX, y: e.clientY } : null }
const onUp = (e: MouseEvent) => {
    const start = press
    press = null
    if (start && props.show && isOutside(e) && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 10) close()
}
const listenOutside = (on: boolean) => {
    const listeners: [string, (e: MouseEvent) => void][] = [['pointerdown', onDown], ['pointerup', onUp]]
    for (const [type, fn] of listeners)
        on ? document.addEventListener(type, fn as EventListener) : document.removeEventListener(type, fn as EventListener)
}
let outsideTimer: ReturnType<typeof setTimeout> | undefined
watch(() => props.show, v => {
    if (!import.meta.client) return
    clearTimeout(outsideTimer)
    listenOutside(false)
    if (v) outsideTimer = setTimeout(() => listenOutside(true), 50)
}, { immediate: true })
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
    clearTimeout(outsideTimer)
    listenOutside(false)
})

// Shift from the center of the modal to the center of the button that opened it (0 when there is no button)
const offsetFromButton = () => {
    const rect = props.activeButton?.getBoundingClientRect?.()
    if (!rect) return { x: 0, y: 0 }
    return { x: rect.left + rect.width / 2 - innerWidth / 2, y: rect.top + rect.height / 2 - innerHeight / 2 }
}

// The modal keeps its final size and place (modal-dialog.css): only its transform and opacity move,
// which the graphics card animates smoothly (no layout computed on every frame)
const animate = (el: Element, frames: Keyframe[], duration: number, easing: string, done: () => void) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return done()
    el.animate(frames, { duration, easing }).onfinish = done
}

// Opening: grows from the button that opened it
const enter = (el: Element, done: () => void) => {
    const { x, y } = offsetFromButton()
    animate(el, [
        { transform: `translate(${x}px, ${y}px) scale(0.3)`, opacity: 0 },
        { transform: 'none', opacity: 1 },
    ], OPEN_MS(), motionEase(), done)
}

// Closing: shrinks back into the button that opened it
const leave = (el: Element, done: () => void) => {
    const { x, y } = offsetFromButton()
    animate(el, [
        { transform: 'none', opacity: 1 },
        { transform: `translate(${x}px, ${y}px) scale(0.3)`, opacity: 0 },
    ], CLOSE_MS(), 'cubic-bezier(0.4, 0, 1, 1)', done)
}
</script>
