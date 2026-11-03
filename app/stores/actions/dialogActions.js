/*
 * Actions of the dialog store (stores/dialog.js): open and close the dialog, show and remove the notifications.
 * Use them through the helpers of utils/dialog.js.
 */

// Answer of the open dialog (kept outside the state: a function is not data)
let answer = null

// Time a notification stays on screen (milliseconds): an error stays longer, so it can be read
const TOAST_DURATION = { success: 3500, error: 7000 }
let toastId = 0

// "this" is the store: this.current, this.toasts
export const dialogActions = {
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
}
