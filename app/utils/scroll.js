/*
 * Smooth scroll to a section of the page, its top right under the header (header links, menu, arrow of the home page).
 *   scrollToSection('projects')          on the home page
 *   goToSection(router, 'contact')       from any page: the home page first, then the section
 */

// Height of the compact header once the page has scrolled (4.5rem, Header.vue) and its thin bottom line
const compactHeader = () => 4.5 * parseFloat(getComputedStyle(document.documentElement).fontSize) + 1

export const scrollToSection = id => {
    const el = document.getElementById(id)
    if (!el) return
    // The whole section (its ground and its top margin), not only its content
    const target = el.closest('.section-wrapper') || el
    const room = compactHeader()
    // From the top of the page the header is still tall: it gets lower while scrolling and the page moves up by the difference
    const header = document.querySelector('header')
    const shrink = header && !header.classList.contains('scrolled') ? Math.max(0, header.offsetHeight - room) : 0
    const top = target.getBoundingClientRect().top + window.scrollY - room - shrink
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
}

// Resolves once the test is true, checked at every frame (false after the timeout)
const waitFor = (test, timeout = 4000) => new Promise(resolve => {
    const start = performance.now()
    const tick = () => test() ? resolve(true) : performance.now() - start > timeout ? resolve(false) : requestAnimationFrame(tick)
    tick()
})

// From another page: the home page opens, its change of page fades (out-in), only then is its section there to scroll to
export const goToSection = async (router, id) => {
    if (router.currentRoute.value.path !== '/') {
        await router.push('/')
        await waitFor(() => document.getElementById(id) && !document.querySelector('.page-leave-active, .page-enter-active'))
    }
    scrollToSection(id)
}
