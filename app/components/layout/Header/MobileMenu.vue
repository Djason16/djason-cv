<template>
    <!--
        Full screen menu of tablets and phones, made once at page load and only shown or hidden (nothing to build when it opens), under the header: the sections in large letters rising one after the other,
        "Pay me", the admin, then the email at the bottom. Closes on a link, on Escape and on a page change.
    -->
    <Teleport to="body">
        <!-- The opening lasts as long as the last line rising (its delay included): Vue would otherwise cut the lines in the middle of their move -->
        <Transition name="mobile-menu" :duration="{ enter: 1000, leave: 250 }">
            <div v-show="open" id="mobile-menu" class="mobile-menu" role="dialog" aria-modal="true" :aria-label="t('menu')">
                <nav class="mobile-menu__nav" aria-label="Main Navigation">
                    <!-- Each line rises a little and fades in, one after the other -->
                    <a v-for="(item, i) in items" :key="item.id" :href="`/#${item.id}`" :title="t(item.translationKey)" class="mobile-menu__link"
                        :style="{ '--i': i }" @click.prevent="goTo(item.id)">
                        <span class="mobile-menu__line">
                            <span class="mobile-menu__number text-label">{{ padIndex(i) }}</span>
                            <span class="text-display-m">{{ t(item.translationKey) }}</span>
                        </span>
                    </a>
                    <NuxtLink :to="withTrailingSlash('/pay-me')" :title="t('payMe')" class="mobile-menu__link mobile-menu__pay"
                        :style="{ '--i': items.length }" @click="emit('close')">
                        <span class="mobile-menu__line">
                            <span class="mobile-menu__number text-label">→</span>
                            <span class="text-display-m">{{ t('payMe') }}</span>
                        </span>
                    </NuxtLink>
                    <!-- The admin (its login page when not logged in), like the other lines: no need to scroll to the footer on a phone -->
                    <NuxtLink :to="withTrailingSlash('/admin')" :title="t('adminLink')" class="mobile-menu__link"
                        :style="{ '--i': items.length + 1 }" @click="emit('close')">
                        <span class="mobile-menu__line">
                            <span class="mobile-menu__number text-label">→</span>
                            <span class="text-display-m">{{ t('adminLink') }}</span>
                        </span>
                    </NuxtLink>
                </nav>

                <a v-if="site.email" :href="`mailto:${site.email}`" :title="site.email" class="mobile-menu__email text-body-l"
                    :style="{ '--i': items.length + 2 }">{{ site.email }}</a>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { padIndex } from '@/utils/display.js'
import { nextTick, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLang } from '@/composables/useLang.js'
import { useSite } from '@/composables/useSite.js'
import { withTrailingSlash } from '@/utils/pathHelpers.js'
import { scrollToSection } from '@/utils/scroll.js'

const props = defineProps({
    open: { type: Boolean, default: false },
    // Sections of the home page: { id, translationKey }
    items: { type: Array, required: true },
})
const emit = defineEmits(['close'])

const { getTranslation: t } = useLang()
const site = useSite()
const router = useRouter()

// Closes, goes to the home page if needed, then to the section
const goTo = async id => {
    emit('close')
    if (router.currentRoute.value.path !== '/') await router.push('/')
    await nextTick()
    scrollToSection(id)
}

// While it is open: Escape closes it, the page behind does not scroll. The lock waits for the end of the animations:
// locking makes a phone lay out the whole page again, which would stop the lines in the middle of their move
const onKey = event => { if (event.key === 'Escape') emit('close') }
let lockTimer = null
const lockPage = locked => {
    clearTimeout(lockTimer)
    // Closing frees the page at once: a link of the menu scrolls to its section right after
    if (!locked) document.body.style.overflow = ''
    else lockTimer = setTimeout(() => { document.body.style.overflow = 'hidden' }, 1100)
}
watch(() => props.open, open => {
    lockPage(open)
    // The header gets plain while the menu is open (mobile-menu.css)
    document.documentElement.classList.toggle('menu-open', open)
    if (open) window.addEventListener('keydown', onKey)
    else window.removeEventListener('keydown', onKey)
})
watch(() => router.currentRoute.value.fullPath, () => emit('close'))

onUnmounted(() => {
    clearTimeout(lockTimer)
    document.body.style.overflow = ''
    document.documentElement.classList.remove('menu-open')
    window.removeEventListener('keydown', onKey)
})
</script>
