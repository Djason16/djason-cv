<!-- Details of a project, in the modal of the site (ModalDialog, flush): it grows from its card.
The photo to the edges on the left; on the right its code and year, its name, its text, its details (year, tools) and the link -->
<template>
    <ModalDialog :show="!!project" :title="project?.name || ''" :active-button="activeButton" flush @close="emit('close')">
        <article v-if="project" class="project-modal">
            <div class="project-modal__media">
                <AppImage :src="project.img || '/images/default_image.jpg'" :alt="project.name" width="960" height="640" />
                <span class="project-modal__code eyebrow">{{ padIndex(index, 'PR') }}</span>
            </div>

            <div class="project-modal__body">
                <header class="project-modal__head">
                    <p class="eyebrow">{{ t('projectsLabel') }}</p>
                    <h3 class="project-modal__name text-display-m">{{ project.name }}</h3>
                </header>

                <p v-if="project.short" class="project-modal__text text-body-l">{{ project.short }}</p>

                <!-- Details: one line each, its name on the left -->
                <dl class="project-modal__facts">
                    <div v-if="year" class="project-modal__fact">
                        <dt class="text-label">{{ t('projectYear') }}</dt>
                        <dd class="text-body">{{ year }}</dd>
                    </div>
                    <div v-if="project.skills?.length" class="project-modal__fact">
                        <dt class="text-label">{{ t('projectTools') }}</dt>
                        <dd>
                            <ul class="project-modal__tools text-label">
                                <li v-for="skill in project.skills" :key="skill">{{ t(skill) }}</li>
                            </ul>
                        </dd>
                    </div>
                </dl>

                <a v-if="project.link" :href="project.link" :title="`${t('viewMore')} - ${project.name}`" target="_blank" rel="noopener noreferrer"
                    class="project-modal__link text-label">
                    {{ t('viewMore') }}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 18L18 6M9 6h9v9" /></svg>
                </a>
            </div>
        </article>
    </ModalDialog>
</template>

<script setup>
import { computed } from 'vue'
import { padIndex } from '@/utils/display.js'
import AppImage from '@/components/ui/Image/AppImage.vue'
import ModalDialog from '@/components/ui/Modal/ModalDialog.vue'
import { useLang } from '@/composables/useLang.js'

const { getTranslation: t } = useLang()

const props = defineProps({
    // Project shown (null: closed)
    project: { type: Object, default: null },
    // Its place in the list (its code PR-01...)
    index: { type: Number, default: 0 },
    // Card that opened it: the modal grows from it and shrinks back into it
    activeButton: { type: Object, default: null },
})
const emit = defineEmits(['close'])

const year = computed(() => String(props.project?.date || '').slice(0, 4))
</script>
