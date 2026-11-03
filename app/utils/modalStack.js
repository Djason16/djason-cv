/*
 * The open modals (ModalDialog.vue), shared by every modal of the site: how many are open, and the page behind them.
 * While one is open the page does not scroll, but it is never moved nor restyled: its scrollbar stays and nothing jumps
 * (no layout to compute, the opening stays smooth). Only what would scroll it is stopped: the scroll still going on when
 * the modal opens, the wheel, a finger, the scroll keys. Going from one modal to another (a list to its form) keeps it.
 *
 *   modalOpened()     a modal opens
 *   modalClosed()     a modal closes (or is removed while open)
 *   openModals()      how many are open (the backdrop of global.css stays while one is)
 *   freeIfNoModal()   safety: no modal on the screen any more, nothing counted, locked nor dark
 */

let count = 0

// Inside a modal (or a dialog over it), a part that can scroll moves as usual (its end never moves the page:
// overscroll-behavior in modal-dialog.css); anything else would scroll the page and is ignored
const canScroll = el => el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY)
const scrollsInside = target => {
    const box = target?.closest?.('.morph-modal, .app-dialog')
    if (!box) return false
    for (let el = target; el && el !== box.parentElement; el = el.parentElement) if (canScroll(el)) return true
    return false
}
const blockScroll = e => scrollsInside(e.target) || e.preventDefault()

// Keys that scroll the page; a field being typed in keeps them (a space, the arrows in a text)
const SCROLL_KEYS = new Set([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'])
const blockKeys = e => {
    if (!SCROLL_KEYS.has(e.key) || e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return
    blockScroll(e)
}

const LISTENERS = [['wheel', blockScroll], ['touchmove', blockScroll], ['keydown', blockKeys]]

const lock = () => {
    // A smooth scroll still going on (a wheel turned just before the click, the momentum of a finger) stops where it is
    window.scrollTo({ top: window.scrollY, left: window.scrollX, behavior: 'instant' })
    for (const [type, fn] of LISTENERS) document.addEventListener(type, fn, { passive: false })
}
const unlock = () => {
    for (const [type, fn] of LISTENERS) document.removeEventListener(type, fn)
}

export const openModals = () => count

export const modalOpened = () => {
    if (!count++) lock()
}

export const modalClosed = () => {
    count = Math.max(0, count - 1)
    if (!count) unlock()
}

export const freeIfNoModal = () => {
    if (document.querySelector('.morph-modal')) return
    count = 0
    unlock()
    document.body.classList.remove('modal-open', 'modal-closing')
}
