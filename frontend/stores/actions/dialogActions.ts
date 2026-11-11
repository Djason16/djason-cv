/*
 * Actions of the dialog store (stores/dialog.js): open and close the dialog, show and remove the notifications.
 * Use them through the helpers of utils/dialog.js.
 */

// Answer of the open dialog (kept outside the state: a function is not data)
let answer: ((value: unknown) => void) | null = null

// Time a notification stays on screen (milliseconds): an error stays longer, so it can be read
const TOAST_DURATION = { success: 3500, error: 7000 }
let toastId = 0

// "this" is the store: this.current, this.toasts
// An open dialog, and a notification on screen
export type Dialog = { type: 'alert' | 'confirm' | 'prompt' | 'choice', message: string, inputType?: 'text' | 'date', defaultValue?: string, options?: { value: string, label: string, details?: string[] }[], okLabel?: string, cancelLabel?: string, resolve?: (value: unknown) => void, [key: string]: unknown }
export type Toast = { id: number, variant: 'success' | 'error', message: string }
type DialogStore = { current: Dialog | null, toasts: Toast[], dismiss(id: number): void }

export const dialogActions = {
    // Shows a dialog; resolves to the answer of the admin when it closes
    open(this: DialogStore, dialog: Dialog) {
        answer?.(null)
        this.current = dialog
        return new Promise(resolve => { answer = resolve })
    },

    // Closes the dialog with its answer
    close(this: DialogStore, value: unknown) {
        const resolve = answer
        answer = null
        this.current = null
        resolve?.(value)
    },

    // Shows a notification, removed after a few seconds
    notify(this: DialogStore, variant: 'success' | 'error', message: string) {
        const id = ++toastId
        this.toasts.push({ id, variant, message })
        setTimeout(() => this.dismiss(id), TOAST_DURATION[variant] ?? TOAST_DURATION.success)
    },

    // Removes a notification (timer or close button)
    dismiss(this: DialogStore, id: number) {
        this.toasts = this.toasts.filter(toast => toast.id !== id)
    },
}
