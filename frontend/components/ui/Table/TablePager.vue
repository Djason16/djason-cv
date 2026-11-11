<template>
    <!-- Pages of a long list (no scrollbar in the modals): previous, "2 / 5 · 34 items", next. Hidden with one page. -->
    <nav v-if="pages > 1" class="table-pager" :aria-label="t('pagerLabel')">
        <IconButton icon="chevron-left" :label="t('pagerPrevious')" :disabled="page <= 1" @click="page = Math.max(1, page - 1)" />
        <span class="table-pager__state text-label">{{ page }} / {{ pages }} <span class="table-pager__total">· {{ total }}</span></span>
        <IconButton icon="chevron-right" :label="t('pagerNext')" :disabled="page >= pages" @click="page = Math.min(pages, page + 1)" />
    </nav>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import IconButton from '@/components/ui/Button/IconButton.vue'
import { useLang } from '@/composables/useLang'

const props = defineProps({
    // Number of items, and how many on one page
    total: { type: Number, required: true },
    perPage: { type: Number, required: true },
})
// v-model: the page shown (from 1)
const page = defineModel({ type: Number, default: 1 })
const { getTranslation: t } = useLang()

const pages = computed(() => Math.max(1, Math.ceil(props.total / props.perPage)))
// Fewer items (a search, a delete): never past the last page
watch(pages, last => { if (page.value > last) page.value = last })
</script>

<style scoped>
.table-pager {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    flex-shrink: 0;
}

.table-pager__state {
    min-width: 4.5rem;
    text-align: center;
}

.table-pager__total {
    color: var(--fg-muted);
}

.table-pager :deep(.icon-btn:disabled) {
    opacity: 0.3;
    cursor: default;
}
</style>
