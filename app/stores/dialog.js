import { defineStore } from 'pinia'

/*
 * Dialog and notifications of the site, in place of the browser's alert / confirm / prompt:
 * the dialog (components/ui/Dialog/AppDialog.vue) waits for an answer, the notifications (components/ui/Toast/AppToasts.vue) leave by themselves.
 * Use the helpers of utils/dialog.js: const ok = await showConfirm('Delete?'), showSuccess('Saved')
 */

// Answer of the open dialog (kept outside the state: a function is not data)
let answer = null

// Time a notification stays on screen (milliseconds): an error stays longer, so it can be read
const TOAST_DURATION = { success: 3500, error: 7000 }
let toastId = 0

export const useDialogStore = defineStore('dialog', {
    state: () => ({
        // Open dialog: { type: 'alert' | 'confirm' | 'prompt' | 'choice', message, inputType: 'text' | 'date', defaultValue, options, okLabel, cancelLabel }
        current: null,
        // Notifications on screen: { id, variant: 'success' | 'error', message }
        toasts: [],
    }),
    actions: {
        // Shows a dialog; resolves to the answer of the admin when it closes
        open(dialog) {
            answer?.(null)
            this.current = dialog
            return new Promise(resolve => { answer = resolve })
        },

        // Closes the dialog with its answer
        close(value) {
            const resolve = answer
            answer = null
            this.current = null
            resolve?.(value)
        },

        // Shows a notification, removed after a few seconds
        notify(variant, message) {
            const id = ++toastId
            this.toasts.push({ id, variant, message })
            setTimeout(() => this.dismiss(id), TOAST_DURATION[variant] ?? TOAST_DURATION.success)
        },

        // Removes a notification (timer or close button)
        dismiss(id) {
            this.toasts = this.toasts.filter(toast => toast.id !== id)
        },
    },
})
