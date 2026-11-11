<template>
    <!-- Floating arrows: back to the top once the visitor scrolled down, to the bottom while the bottom is still far.
         When one leaves, the other slides to its new place (a move, not a change of size: smooth on phones) -->
    <TransitionGroup name="floating-btn" tag="div" class="scroll-buttons">
        <button v-if="showTop" key="top" type="button" class="floating-btn text-small scroll-buttons__top"
            :aria-label="t('backToTop')" :title="t('backToTop')" @click="go(false)">
            <i class="fa-solid fa-arrow-up" aria-hidden="true" />
        </button>
        <button v-if="showEnd" key="end" type="button" class="floating-btn text-small scroll-buttons__end"
            :aria-label="t('backToEnd')" :title="t('backToEnd')" @click="go(true)">
            <i class="fa-solid fa-arrow-down" aria-hidden="true" />
        </button>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { useLang } from '@/composables/useLang'
import { onMounted, onUnmounted, ref } from 'vue'

const { getTranslation: t } = useLang()

// Distance in px past which an arrow is shown (from the top for the up arrow, from the bottom for the down arrow)
const SHOWN_PAST = 200

const showTop = ref(false)
const showEnd = ref(false)

// Smooth scroll to the top or to the bottom of the page
const go = (toEnd: boolean) => window.scrollTo({ top: toEnd ? document.documentElement.scrollHeight : 0, behavior: 'smooth' })

const update = () => {
    showTop.value = window.scrollY > SHOWN_PAST
    showEnd.value = document.documentElement.scrollHeight - window.innerHeight - window.scrollY > SHOWN_PAST
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

<style>
/* The two arrows, one above the other, with the space of the other floating buttons (AppShell.vue) */
.scroll-buttons {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--floating-gap);
}

/* No arrow (a short page): no empty space above the languages */
.scroll-buttons:empty {
    display: none;
}

/* The arrow that stays slides to its new place */
.scroll-buttons .floating-btn-move {
    transition: transform var(--motion-base) var(--ease);
}

/* A leaving arrow is taken out of the stack but kept where it was while it fades (the stack is held by its bottom) */
.scroll-buttons .floating-btn-leave-active {
    position: absolute;
}

.scroll-buttons .scroll-buttons__end.floating-btn-leave-active {
    bottom: 0;
}

.scroll-buttons .scroll-buttons__top.floating-btn-leave-active {
    bottom: calc(100% + var(--floating-gap));
}
</style>
