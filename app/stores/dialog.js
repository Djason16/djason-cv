import { defineStore } from 'pinia'
import { dialogActions } from './actions/dialogActions.js'

/*
 * Dialog and notifications of the site, in place of the browser's alert / confirm / prompt:
 * the dialog (components/ui/Dialog/AppDialog.vue) waits for an answer, the notifications (components/ui/Toast/AppToasts.vue) leave by themselves.
 * Use the helpers of utils/dialog.js: const ok = await showConfirm('Delete?'), showSuccess('Saved')
 */
export const useDialogStore = defineStore('dialog', {
    state: () => ({
        // Open dialog: { type: 'alert' | 'confirm' | 'prompt' | 'choice', message, inputType: 'text' | 'date', defaultValue, options, okLabel, cancelLabel }
        current: null,
        // Notifications on screen: { id, variant: 'success' | 'error', message }
        toasts: [],
    }),
    actions: dialogActions,
})
