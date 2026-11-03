<template>
    <!-- Modal with a form: the fields in the slot, then the feedback message and Cancel / Save -->
    <ModalDialog :show="show" :title="title" @close="emit('close')">
        <form class="form-modal" :style="{ maxHeight }" @submit.prevent="emit('submit')">
            <!-- Hidden username field: keeps password managers from filling the real fields -->
            <input type="text" name="username" autocomplete="username" tabindex="-1"
                style="position:absolute;opacity:0;width:0;height:0;border:none;margin:0;padding:0" />

            <!-- The fields scroll when they are taller than the modal, the message and the buttons stay in sight -->
            <div ref="formRef" class="form-modal__fields" :class="{ 'has-scroll': hasScroll, 'form-modal__fields--grid': columns > 1 }"
                :style="columns > 1 ? { '--form-columns': columns } : null">
                <slot />
            </div>

            <!-- No top margin: the gap of the form already spaces it -->
            <MessageBox :message="message" margin="0" />

            <div class="modal-footer">
                <HeroButton type="button" iconClass="fas fa-times" :label="t('cancel')"
                    @click="emit('close')" />
                <HeroButton type="submit" primary iconClass="fas fa-check" :disabled="loading"
                    :label="t(loading ? 'saving' : 'save')" />
            </div>
        </form>
    </ModalDialog>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import MessageBox from '@/components/ui/Message/MessageBox.vue'
import ModalDialog from '@/components/ui/Modal/ModalDialog.vue'

const { getTranslation: t } = useLang()

const props = defineProps({
    show: Boolean,
    title: { type: String, required: true },
    // translatedMessage of useMessage()
    message: { type: Object, default: null },
    loading: Boolean,
    maxHeight: { type: String, default: '70vh' },
    // 2 or 3: the fields side by side on a computer, in this many columns (a .is-wide element takes the whole line)
    columns: { type: Number, default: 1 },
})
const emit = defineEmits(['close', 'submit'])

// A scrollbar appears when the fields are taller than the modal: room is kept for it
const formRef = ref(null)
const hasScroll = ref(false)
const checkScroll = () => { if (formRef.value) hasScroll.value = formRef.value.scrollHeight > formRef.value.clientHeight }

// Fields shown or hidden (client type, pricing mode...) change the height
let observer = null
watch(() => props.show, visible => {
    observer?.disconnect()
    observer = null
    if (!visible) return
    setTimeout(() => {
        if (!formRef.value) return
        checkScroll()
        observer = new MutationObserver(() => setTimeout(checkScroll, 50))
        observer.observe(formRef.value, { childList: true, subtree: true, characterData: true })
    }, 100)
})

onMounted(() => window.addEventListener('resize', checkScroll))
onBeforeUnmount(() => {
    observer?.disconnect()
    window.removeEventListener('resize', checkScroll)
})
</script>

<style scoped>
/* Fields (scrolling), then the message and the buttons */
.form-modal,
.modal-footer {
    display: flex;
    flex-direction: column;
}

.form-modal {
    gap: 1.75rem;
    min-width: 25vw;
    max-width: 90vw;
    overflow: hidden;
    padding: 0;
    box-sizing: border-box;
}

.form-modal__fields {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
    min-height: 0;
    overflow-y: auto;
}

/* Room for the scrollbar */
.form-modal__fields.has-scroll {
    padding-right: 1rem;
}

/* Fields of the slot */
.form-modal :deep(.form-group) {
    display: flex;
    flex-direction: column;
    gap: .5rem;
}

.form-modal :deep(.row-group) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-modal :deep(.row-group .form-group) {
    flex: 1;
}

.modal-footer {
    flex-direction: row;
    flex-wrap: wrap;
    flex-shrink: 0;
    gap: 1rem;
}

/* Large screens */
@media (min-width: 1025px) {
    .form-modal :deep(.row-group) {
        flex-direction: row;
    }

    /* Side by side: a wider modal, less height; the groups of fields melt into the grid */
    .form-modal__fields--grid {
        display: grid;
        grid-template-columns: repeat(var(--form-columns), minmax(0, 1fr));
        gap: 1.75rem 2.5rem;
        width: min(calc(var(--form-columns) * 480px), 82vw);
    }

    .form-modal__fields--grid > :deep(.row-group) {
        display: contents;
    }

    .form-modal__fields--grid > :deep(.is-wide) {
        grid-column: 1 / -1;
    }
}

/* Tablet and phone */
@media (max-width: 1024px) {
    .form-modal {
        width: 100%;
        min-width: auto;
        max-width: 90vw;
    }
}

/* Tablet and phone: Cancel and Save the whole width of the modal, sharing it equally */
@media (max-width: 1024px) {
    .modal-footer {
        width: 100%;
    }

    .modal-footer > :deep(*) {
        flex: 1 1 0;
        min-width: max-content;
        justify-content: center;
    }
}

/* Tablet upright and phone: one scroll only, the one of the modal (its fields and its buttons follow each other) */
@media (max-width: 768px) {
    .form-modal,
    .form-modal__fields {
        overflow: visible;
    }

    /* No height of its own (its maxHeight is for computers): the fields never pass under the buttons */
    .form-modal {
        max-height: none !important;
    }

    .form-modal__fields {
        flex: none;
    }

    .form-modal__fields.has-scroll {
        padding-right: 0;
    }
}
</style>
