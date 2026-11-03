/*
 * Smooth scroll to a section of the page, its top right under the header (header links, menu, arrow of the home page).
 *   scrollToSection('projects')
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
