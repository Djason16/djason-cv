/*
 * v-reveal: the element appears when it comes on screen (style and variants: assets/css/components/reveal.css).
 *   v-reveal            rises a little and fades in
 *   v-reveal="'group'"  a header or a block: its parts one after the other
 *   v-reveal="'image'"  a photo fading in, coming slightly closer
 * Known on the server too (it adds nothing there: the content stays visible in the HTML, for search engines);
 * nothing moves when the visitor asked for less motion.
 */
export default defineNuxtPlugin(nuxtApp => {
    let observer = null

    // One observer for every element, created in the browser on first use
    const getObserver = () => {
        if (observer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return observer
        observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                // In view: comes in. Out through the bottom (scrolling back up): leaves, to come in again next time.
                // Out through the top it stays: nothing moves in the part of the page already read
                if (entry.isIntersecting) entry.target.classList.add('is-revealed')
                else if (entry.boundingClientRect.top > 0) entry.target.classList.remove('is-revealed')
            }
        }, { rootMargin: '0px 0px -8% 0px' })
        return observer
    }

    nuxtApp.vueApp.directive('reveal', {
        // Server: no attribute, no class
        getSSRProps: () => ({}),
        mounted(el, { value }) {
            const watcher = getObserver()
            if (!watcher) return
            el.classList.add('reveal', `reveal--${value || 'rise'}`)
            watcher.observe(el)
        },
        unmounted(el) {
            observer?.unobserve(el)
        },
    })
})
