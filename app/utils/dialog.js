import { useDialogStore } from '@/stores/dialog.js'

/*
 * Dialog and notifications in the design of the site, in place of the browser's alert / confirm / prompt (stores/dialog.js).
 *   showSuccess('Saved') / showFailure('Failed')     notification at the top right, leaves by itself (does not wait)
 * The dialog helpers wait for the answer:
 *   await showAlert('Read this')                     nothing (a message to read, such as a list of things to fix)
 *   await showConfirm('Delete?')                     true / false
 *   await showPrompt('Number?', '12')                the text, or null when cancelled
 *   await showDatePrompt('Due date?', '25/12/2026')  a date picked in a calendar, as DD/MM/YYYY ('' when left empty), or null
 *   await showChoice('Payment?', [{ value, label, details }])   the value of the option, or null when cancelled
 * okLabel / cancelLabel change the texts of the buttons (translated texts).
 */

export const showAlert = message => useDialogStore().open({ type: 'alert', message })

// Result of an action of the admin: notification with a green check, or a red warning
export const showSuccess = message => useDialogStore().notify('success', message)
export const showFailure = message => useDialogStore().notify('error', message)

// Success or error notification depending on the result of an API call ({ success })
export const showResult = (res, successText, errorText) => (res?.success ? showSuccess(successText) : showFailure(errorText))

export const showConfirm = (message, labels = {}) => useDialogStore().open({ type: 'confirm', message, ...labels })

export const showPrompt = (message, defaultValue = '') => useDialogStore().open({ type: 'prompt', message, defaultValue })

// Date with a calendar: the dialog works in YYYY-MM-DD (date input), the callers in DD/MM/YYYY
const toIso = text => {
    const [d, m, y] = String(text || '').split('/')
    return d && m && y ? `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` : ''
}
const fromIso = iso => {
    const [y, m, d] = String(iso || '').split('-')
    return y && m && d ? `${d}/${m}/${y}` : ''
}

export const showDatePrompt = async (message, defaultValue = '') => {
    const iso = await useDialogStore().open({ type: 'prompt', inputType: 'date', message, defaultValue: toIso(defaultValue) })
    return iso === null ? null : fromIso(iso)
}

export const showChoice = (message, options) => useDialogStore().open({ type: 'choice', message, options })
