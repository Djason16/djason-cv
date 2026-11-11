/*
 * What follows a message (a new page, a modal that closes) waits the same time everywhere on the site, so the message
 * can always be read first:
 *   showMessage('success', 'logoutSuccess', MESSAGE_DELAY)
 *   await afterMessage()
 *   goToPage('/')
 */

// How long a message is shown before what follows it (milliseconds)
export const MESSAGE_DELAY = 2000

export const afterMessage = () => new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY))
