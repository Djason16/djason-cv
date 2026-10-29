<template>
    <!-- Modal with a form: the fields in the slot, then the feedback message and Cancel / Save -->
    <ModalDialog :show="show" :title="title" @close="emit('close')">
        <form ref="formRef" class="form-modal" :class="{ 'has-scroll': hasScroll }" :style="{ maxHeight }"
            @submit.prevent="emit('submit')">
            <!-- Hidden username field: keeps password managers from filling the real fields -->
            <input type="text" name="username" autocomplete="username" tabindex="-1"
                style="position:absolute;opacity:0;width:0;height:0;border:none;margin:0;padding:0" />

            <slot />

            <MessageBox :message="message" />

            <div class="modal-footer">
                <HeroButton type="button" iconClass="fas fa-times" :label="t('cancel')"
                    @click="emit('close')" />
                <HeroButton type="submit" iconClass="fas fa-check" :disabled="loading"
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
    maxHeight: { type: String, default: '60vh' },
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
/* Scrolling form and its buttons */
.form-modal,
/* Buttons at the bottom */
.modal-footer {
    display: flex;
    flex-direction: column;
    transition: all .3s ease;
}

.form-modal {
    gap: 2rem;
    min-width: 25vw;
    max-width: 90vw;
    overflow-y: auto;
    padding: 0;
    box-sizing: border-box;
}

/* Room for the scrollbar */
.form-modal.has-scroll {
    padding-right: 1rem;
}

/* Fields of the slot */
.form-modal :deep(.form-group) {
    display: flex;
    flex-direction: column;
    gap: .5rem;
    transition: all .3s ease;
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
    gap: 1rem;
    margin-top: auto;
}

.form-modal :deep(.message-box p) {
    margin: 0;
}

/* Large screens */
@media (min-width: 1025px) {
    .form-modal :deep(.row-group) {
        flex-direction: row;
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
</style>
