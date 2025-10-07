<template>
    <Teleport to="body">
        <transition name="morph" @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter" @leave="leave">
            <div v-if="show" ref="modalEl" class="morph-modal" tabindex="-1" @click.self="close">
                <div class="modal-inner">
                    <header class="modal-header">
                        <h3 class="text-large text-bold">{{ title }}</h3>
                        <button class="close-btn" @click="close" :title="$lang.getTranslation('close')"
                            aria-label="$lang.getTranslation('close')">
                            <i class="fas fa-times"></i>
                        </button>
                    </header>

                    <div class="modal-body">
                        <slot />
                    </div>
                    <footer v-if="$slots.footer" class="modal-footer">
                        <slot name="footer" />
                    </footer>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

// Props and emits
const props = defineProps({
    show: Boolean,
    title: { type: String, default: '' },
    position: Object,
    activeButton: Object
})
const emit = defineEmits(['close'])
const modalEl = ref(null)
const close = () => emit('close')

// Focus modal when shown
watch(() => props.show, async val => val && await nextTick().then(() => modalEl.value?.focus()))

// Close on Escape key globally
const onKeyDown = e => e.key === 'Escape' && props.show && close()
onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))

// --- Morph animations ---
const beforeEnter = el => {
    const { top = window.innerHeight / 2, left = window.innerWidth / 2, size = 0 } = props.position || {}
    Object.assign(el.style, { top: `${top}px`, left: `${left}px`, width: `${size}px`, height: `${size}px`, borderRadius: '50%', opacity: '0', padding: '0', transform: 'translate(-50%, -50%)', willChange: 'top, left, width, height, opacity, border-radius' })
}

const enter = (el, done) => {
    el.offsetHeight // force repaint
    Object.assign(el.style, { transition: 'all 0.4s ease', top: '50%', left: '50%', width: 'fit-content', height: 'fit-content', maxWidth: '90vw', maxHeight: '90vh', borderRadius: '12px', opacity: '1', padding: '2rem', transform: 'translate(-50%, -50%)' })
    const inner = el.querySelector('.modal-inner'); if (inner) inner.style.opacity = '1'
    setTimeout(() => { el.style.willChange = 'auto'; done() }, 400)
}
const afterEnter = el => el.style.transition = ''

const leave = (el, done) => {
    if (!props.activeButton) return setTimeout(done, 0)
    const rect = props.activeButton.getBoundingClientRect()
    const inner = el.querySelector('.modal-inner'); if (inner) inner.style.opacity = '0'
    Object.assign(el.style, { transition: 'all 0.4s ease', top: `${rect.top + rect.height / 2}px`, left: `${rect.left + rect.width / 2}px`, width: `${rect.width}px`, height: `${rect.width}px`, borderRadius: '50%', opacity: '0', padding: '0', transform: 'translate(-50%,-50%)', willChange: 'top, left, width, height, opacity, border-radius' })
    setTimeout(() => { el.style.willChange = 'auto'; done() }, 400)
}
</script>

<style scoped>
.morph-modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(180deg, var(--second-color), var(--third-color));
    background-size: 200% 200%;
    background-position: center;
    z-index: 999;
    overflow: hidden;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    will-change: transform, opacity;
}

.modal-inner {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: auto;
    box-sizing: border-box;
    will-change: transform, opacity
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-shrink: 0
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--text-color-light)
}

.modal-body {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    box-sizing: border-box
}

.modal-footer {
    border-top: 1px solid var(--text-color-grey);
    padding-top: 1rem;
    margin-top: 1rem;
    flex-shrink: 0
}
</style>