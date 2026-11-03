<template>
    <!-- Projects added from the admin: one compact row each (image, name, date, skills, text), New / Edit open the project form -->
    <TableModal :show="show" :title="t('viewProjects')" max-width="1200px"
        v-model:search="search" :search-placeholder="t('searchProjects')" @close="emit('close')">
        <ul v-if="filteredApiProjects.length" ref="list" :key="page" class="project-rows" :class="turn && `turn-${turn}`">
            <li v-for="(p, i) in pageProjects" :key="p.id" class="project-row" :style="{ '--i': i }">
                <span class="project-row__index eyebrow">{{ padIndex((page - 1) * perPage + i) }}</span>
                <img v-if="p.img" :src="imageOf(p)" :alt="p.name" :title="p.name" class="project-row__thumb" loading="lazy" />
                <span v-else class="project-row__thumb project-row__thumb--empty" aria-hidden="true"><i class="fas fa-image"></i></span>

                <div class="project-row__main">
                    <p class="project-row__name text-display-xs">{{ p.name }}</p>
                    <p class="project-row__meta text-label">{{ dateOf(p) }}<template v-if="p.link"> · <a :href="p.link" :title="p.link" target="_blank" rel="noopener">{{ hostOf(p.link) }}</a></template></p>
                    <ul v-if="p.skills?.length" class="project-row__skills">
                        <li v-for="skill in p.skills" :key="skill" class="text-body-s">{{ t(skill) }}</li>
                    </ul>
                </div>

                <p class="project-row__text text-body-s" :title="p.short_fr">{{ p.short_fr }}</p>

                <div class="project-row__actions">
                    <IconButton icon="pen" :label="t('editProject')" @click="emit('open', 'project', { project: p })" />
                    <IconButton icon="trash" variant="danger" :label="t('delete')" @click="deleteProject(p)" />
                </div>
            </li>
        </ul>
        <div v-else class="project-rows__empty text-display-xs">{{ t('noProjectsFound') }}</div>
        <!-- Pages instead of a scrollbar -->
        <TablePager v-model="page" :total="filteredApiProjects.length" :per-page="perPage" />

        <template #actions>
            <HeroButton primary iconClass="fas fa-plus" :label="t('addProjects')" @click="emit('open', 'project', { project: null })" />
        </template>
    </TableModal>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import IconButton from '@/components/ui/Button/IconButton.vue'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import TablePager from '@/components/ui/Table/TablePager.vue'
import { useLang } from '@/composables/useLang.js'
import { useProjects } from '@/composables/useProjects.js'
import { showConfirm, showResult } from '@/utils/dialog.js'
import { padIndex } from '@/utils/display.js'

const props = defineProps({ show: Boolean })
// open: another tool of the admin (the project form), with its props
const emit = defineEmits(['close', 'open'])

const lang = useLang()
const t = lang.getTranslation
const { projects, fetchProjects, removeProject } = useProjects()
const search = ref('')
// Projects per page (5 at most, fewer when they do not all fit above the buttons), and the page shown
const PER_PAGE = 5
const perPage = ref(PER_PAGE)
const page = ref(1)
const list = ref(null)
// A new page: its rows slide in from its side (editable-table-detail.css)
const turn = ref(null)
watch(page, (now, before) => { turn.value = now > before ? 'next' : 'prev' })
watch(search, () => { page.value = 1 })

// Projects added from the admin (they have both short texts), filtered by the search bar
const apiProjects = computed(() => projects.value.filter(p => p.short_fr && p.short_en))
const filteredApiProjects = computed(() => {
    const q = search.value.toLowerCase().trim()
    if (!q) return apiProjects.value
    return apiProjects.value.filter(p =>
        [p.name, p.short_fr, p.short_en, p.link, ...(p.skills || []).map(s => t(s))].some(v => v?.toString().toLowerCase().includes(q)))
})

const pageProjects = computed(() => filteredApiProjects.value.slice((page.value - 1) * perPage.value, page.value * perPage.value))

// As many rows as the place of the list holds (computer and tablet: the list never goes over the buttons at the bottom);
// on a phone the modal scrolls as a whole and every page keeps its 5 rows
const fit = async () => {
    perPage.value = PER_PAGE
    await nextTick()
    const row = list.value?.querySelector('.project-row')
    if (!row || list.value.scrollHeight <= list.value.clientHeight + 1) return
    perPage.value = Math.max(1, Math.floor(list.value.clientHeight / row.offsetHeight))
    page.value = Math.min(page.value, Math.max(1, Math.ceil(filteredApiProjects.value.length / perPage.value)))
}
// Measured right after the list is drawn, before it shows: never a scrollbar for a moment
watch(() => [props.show, filteredApiProjects.value.length], ([open]) => open && fit(), { flush: 'post' })
onMounted(() => window.addEventListener('resize', fit))
onBeforeUnmount(() => window.removeEventListener('resize', fit))

const imageOf = p => p.img.startsWith('api/') ? `/${p.img}` : p.img
const dateOf = p => p.date ? new Date(p.date).toLocaleDateString(lang.current.value === 'en' ? 'en-GB' : 'fr-FR') : '—'
const hostOf = link => { try { return new URL(link).hostname.replace(/^www\./, '') } catch { return link } }

// Deletes a project after a confirmation
const deleteProject = async item => {
    if (!(await showConfirm(t('deleteProjectConfirm', { name: item.name }), { okLabel: t('dialogDelete') }))) return
    const res = await removeProject(item.id)
    await showResult(res, t('deleteSuccess'), t('deleteFailed'))
}

// Fresh list each time the modal opens
watch(() => props.show, val => val && fetchProjects(), { immediate: true })
</script>

<style scoped>
/* One row per project: number, image, name / date / skills, text, buttons; thin rules like the tables of the site.
   Its rows never go over the buttons: as many as fit (fit above), and if one is taller the list scrolls inside */
.project-rows {
    margin: 0;
    padding: 0;
    list-style: none;
    border-top: 1px solid rgba(255, 255, 255, 0.28);
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    /* The rows fit (fit above): no scrollbar to show, not even while a new page slides in from the side */
    scrollbar-width: none;
}

.project-rows::-webkit-scrollbar {
    display: none;
}

.project-row {
    display: grid;
    grid-template-columns: 2.5rem 112px minmax(0, 1.1fr) minmax(0, 1.4fr) auto;
    align-items: center;
    gap: 1.25rem;
    padding: 0.9rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    transition: background-color var(--motion-fast) var(--ease), box-shadow var(--motion-fast) var(--ease);
}

.project-row:hover {
    background-color: rgba(255, 255, 255, 0.035);
    box-shadow: inset 2px 0 0 var(--mint);
}

.project-row__index {
    color: var(--mint);
}

.project-row__thumb {
    width: 112px;
    height: 63px;
    object-fit: cover;
    background: var(--panel);
}

.project-row__thumb--empty {
    display: grid;
    place-items: center;
    color: var(--paper-muted);
}

.project-row__main {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
}

.project-row__name,
.project-row__meta {
    margin: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.project-row__meta {
    color: var(--paper-muted);
}

.project-row__meta a {
    color: var(--paper);
}

/* Skills: small tags on one or two lines */
.project-row__skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin: 0.15rem 0 0;
    padding: 0;
    list-style: none;
}

.project-row__skills li {
    padding: 0.15rem 0.5rem;
    background: rgba(126, 230, 168, 0.1);
    color: var(--mint);
}

/* French text, two lines at most */
.project-row__text {
    display: -webkit-box;
    margin: 0;
    overflow: hidden;
    color: var(--paper-muted);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.project-row__actions {
    display: flex;
    gap: 0.35rem;
}

.project-rows__empty {
    padding: 3rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    color: var(--paper-muted);
    text-align: center;
}

/* Tablet: no text column */
@media (max-width: 1024px) {
    .project-row {
        grid-template-columns: 2rem 96px minmax(0, 1fr) auto;
    }

    .project-row__thumb {
        width: 96px;
        height: 54px;
    }

    .project-row__text {
        display: none;
    }
}

/* Phone: image and name side by side, the buttons under the name */
@media (max-width: 560px) {
    .project-row {
        grid-template-columns: 80px minmax(0, 1fr);
        gap: 0.4rem 0.9rem;
        padding: 0.8rem 0.25rem;
    }

    .project-row__index {
        display: none;
    }

    .project-row__thumb {
        grid-row: span 2;
        width: 80px;
        height: 45px;
        align-self: start;
    }

    .project-row__actions {
        grid-column: 2;
    }
}
</style>
