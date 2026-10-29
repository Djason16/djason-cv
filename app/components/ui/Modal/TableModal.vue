<template>
    <!-- Modal with a table: optional search bar, the table in the slot, extra buttons before "Close" -->
    <ModalDialog :show="show" :title="title" @close="emit('close')">
        <div class="table-modal" :style="{ maxWidth, minWidth }">
            <div v-if="searchPlaceholder" class="search-bar">
                <input v-model="search" type="text" :placeholder="searchPlaceholder" :title="searchPlaceholder"
                    class="text-small" autocomplete="off" />
            </div>

            <slot />

            <div class="modal-footer">
                <slot name="actions" />
                <HeroButton type="button" iconClass="fas fa-times" :label="t('close')"
                    @click="emit('close')" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import ModalDialog from '@/components/ui/Modal/ModalDialog.vue'

const { getTranslation: t } = useLang()

defineProps({
    show: Boolean,
    title: { type: String, required: true },
    // Placeholder of the search bar: no placeholder = no search bar
    searchPlaceholder: { type: String, default: '' },
    maxWidth: { type: String, default: '1920px' },
    minWidth: { type: String, default: '60vw' },
})
const emit = defineEmits(['close'])

// Text of the search bar (v-model:search)
const search = defineModel('search', { type: String, default: '' })
</script>

<style scoped>
/* Search bar, table and buttons stacked */
.table-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-height: 80vh;
    overflow: hidden;
    color: var(--text-color-dark);
    box-sizing: border-box;
}

/* Search bar above the table */
.search-bar {
    display: flex;
    justify-content: flex-end;
}

/* Buttons at the bottom */
.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto;
}
</style>
