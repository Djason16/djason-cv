<template>
    <!-- Notifications of the result of an action (showSuccess / showFailure of utils/dialog.js), stacked at the top right -->
    <ClientOnly>
        <Teleport to="body">
            <TransitionGroup tag="div" name="app-toast" class="app-toasts" aria-live="polite">
                <div v-for="toast in dialogs.toasts" :key="toast.id" class="app-toast" :class="`is-${toast.variant}`"
                    :role="toast.variant === 'error' ? 'alert' : 'status'">
                    <i class="app-toast__icon"
                        :class="toast.variant === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation'"
                        aria-hidden="true" />
                    <p class="app-toast__message text-normal">{{ toast.message }}</p>
                    <button type="button" class="app-toast__close" :aria-label="t('close')" :title="t('close')"
                        @click="dialogs.dismiss(toast.id)">
                        <i class="fas fa-xmark" aria-hidden="true" />
                    </button>
                </div>
            </TransitionGroup>
        </Teleport>
    </ClientOnly>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { useDialogStore } from '@/stores/dialog.js'

const { getTranslation: t } = useLang()
const dialogs = useDialogStore()
</script>
