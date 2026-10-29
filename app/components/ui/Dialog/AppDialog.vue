<template>
    <!-- Dialog of the site that waits for an answer (alert, confirm, prompt, choice), opened with the helpers of utils/dialog.js -->
    <ClientOnly>
        <Teleport to="body">
            <Transition name="app-dialog-fade">
                <div v-if="dialog" class="app-dialog" @click.self="cancel" @keydown.esc.stop="cancel">
                    <div ref="box" class="app-dialog__box" role="dialog" aria-modal="true"
                        :aria-label="dialog.message" tabindex="-1">
                        <p class="app-dialog__message text-normal">{{ dialog.message }}</p>

                        <!-- Text or date (calendar) asked to the admin -->
                        <input v-if="dialog.type === 'prompt'" ref="input" v-model="text" :type="dialog.inputType || 'text'"
                            class="app-dialog__input text-normal" @keydown.enter.prevent="submit">

                        <!-- One button per option, with its details -->
                        <div v-if="dialog.type === 'choice'" class="app-dialog__options">
                            <button v-for="option in dialog.options" :key="option.value" type="button"
                                class="app-dialog__option" @click="dialogs.close(option.value)">
                                <span class="text-normal text-bold">{{ option.label }}</span>
                                <small v-for="detail in option.details" :key="detail" class="text-small">{{ detail }}</small>
                            </button>
                        </div>

                        <div class="app-dialog__actions">
                            <HeroButton v-if="dialog.type !== 'alert'" size="small" iconClass="fas fa-xmark"
                                :label="dialog.cancelLabel || t('cancel')" @click="cancel" />
                            <HeroButton v-if="dialog.type !== 'choice'" size="small" iconClass="fas fa-check"
                                :label="dialog.okLabel || t('dialogOk')" @click="submit" />
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </ClientOnly>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { nextTick, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import { useLang } from '@/composables/useLang.js'
import { useDialogStore } from '@/stores/dialog.js'

const { getTranslation: t } = useLang()
const dialogs = useDialogStore()
const { current: dialog } = storeToRefs(dialogs)
const text = ref('')
const box = ref(null)
const input = ref(null)

// Answer of each type when the admin cancels (Escape, click outside, Cancel)
const CANCELLED = { alert: undefined, confirm: false, prompt: null, choice: null }

const cancel = () => dialogs.close(CANCELLED[dialog.value.type])

// OK: the typed text for a prompt, true for a confirm
const submit = () => dialogs.close(dialog.value.type === 'prompt' ? text.value : dialog.value.type === 'confirm' ? true : undefined)

// New dialog: its default text, and the focus in it (so Enter and Escape work at once)
watch(dialog, async value => {
    if (!value) return
    text.value = value.defaultValue ?? ''
    await nextTick()
    if (input.value) input.value.focus()
    else box.value?.focus()
})
</script>
