<template>
    <!-- Modal with a table: optional filters and search bar, the table in the slot (it scrolls, the bar and the buttons stay), extra buttons before "Close" -->
    <ModalDialog :show="show" :title="title" @close="emit('close')">
        <div class="table-modal" :style="{ maxWidth, minWidth }">
            <div v-if="searchPlaceholder || $slots.filters" class="search-bar">
                <slot name="filters" />
                <input v-if="searchPlaceholder" v-model="search" type="search" :placeholder="searchPlaceholder" :title="searchPlaceholder"
                    autocomplete="off" />
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

<script setup lang="ts">
import { useLang } from '@/composables/useLang'
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
    min-height: 0;
    flex: 1 1 auto;
    overflow: hidden;
    color: var(--fg);
    box-sizing: border-box;
}

/* Filters on the left, search bar on the right, above the table */
.search-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: flex-end;
    gap: 1rem;
}

.search-bar > :first-child:not(:only-child) {
    margin-right: auto;
}

/* The table (or list) takes the room left and scrolls inside it */
.table-modal > :deep(.editable-table-block),
.table-modal > :deep(.project-rows) {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
}

.table-modal > :deep(.editable-table-block) > .editable-table-wrapper {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
}

/* Same field as the rest of the admin (form-field.css), not too wide */
.search-bar input {
    max-width: 320px;
}

/* Buttons at the bottom */
.modal-footer {
    display: flex;
    flex-wrap: wrap;
    flex-shrink: 0;
    gap: 1rem;
    margin-top: auto;
}

/* Tablet and phone: the buttons the whole width of the modal, sharing it equally */
@media (max-width: 1024px) {
    .modal-footer {
        width: 100%;
    }

    .modal-footer > :deep(*) {
        flex: 1 1 0;
        min-width: max-content;
        justify-content: center;
    }
}

/* Tablet upright and phone: one scroll only, the one of the modal (a scroll inside a scroll hid the bottom of the list) */
@media (max-width: 768px) {
    .table-modal {
        flex: none;
        overflow: visible;
    }

    .table-modal > :deep(.editable-table-block),
    .table-modal > :deep(.project-rows),
    .table-modal > :deep(.editable-table-block) > .editable-table-wrapper {
        flex: none;
        overflow: visible;
    }
}

/* Phone: the filters and the search the whole width, under each other; the buttons side by side, sharing the width */
@media (max-width: 600px) {
    .search-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 0.75rem;
    }

    .search-bar > :first-child:not(:only-child) {
        margin-right: 0;
    }

    .search-bar input {
        max-width: none;
    }

    .modal-footer {
        gap: 0.75rem;
    }
}
</style>
