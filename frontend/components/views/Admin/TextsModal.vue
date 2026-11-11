<template>
    <!-- Texts of the site shown to visitors: changed here, seen at once on the site (stores/siteTexts.js) -->
    <TableModal :show="show" :title="t('textsTitle')" max-width="1400px" v-model:search="search"
        :search-placeholder="t('searchTexts')" @close="emit('close')">
        <!-- One part of the site at a time (the documents included): shorter lists -->
        <template #filters>
            <select class="texts-filter" v-model="group" :aria-label="t('textsGroupFilter')">
                <option value="">{{ t('textsGroupAll') }}</option>
                <option v-for="name in groups" :key="name" :value="name">{{ t(`textsGroup_${name}`) }}</option>
            </select>
        </template>
        <EditableTable :items="rows" :columns="columns" :show-actions="false" item-key="key"
            :empty-message="t('noTextsFound')" @update="handleUpdate" />
    </TableModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import { useLang } from '@/composables/useLang'
import { EDITABLE_TRANSLATIONS, LANGUAGES } from '@/plugins/translations/translations'
import { useSiteTextsStore } from '@/stores/siteTexts'
import { showFailure, showSuccess } from '@/utils/dialog'
import { translateText } from '@/composables/useAutoTranslate'

defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { getTranslation: t } = useLang()
const siteTexts = useSiteTextsStore()
const search = ref('')
const group = ref('')
const groups = Object.keys(EDITABLE_TRANSLATIONS)

// Text shown in a cell: the changed one, otherwise the default one
const textOf = (file: Record<string, Record<string, string>>, lang: string, key: string) => siteTexts.changed[lang]?.[key] || file[lang]?.[key] || ''
const isChanged = (lang: string, key: string) => Boolean(siteTexts.changed[lang]?.[key])

// The texts shown as text in the table (no HTML of the texts runs in the admin)
const escape = (text: string) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Rows: a title row per part of the site, then its texts (filtered by the part picked and the search bar on the key and the texts)
const rows = computed(() => {
    const q = search.value.toLowerCase().trim()
    return Object.entries(EDITABLE_TRANSLATIONS).filter(([name]) => !group.value || name === group.value).flatMap(([name, file]) => {
        const items = Object.keys(file[LANGUAGES[0] ?? ''] || {})
            .map(key => ({ key, group: name, ...Object.fromEntries(LANGUAGES.map(lang => [lang, textOf(file, lang, key)])) }))
            .filter(item => !q || [item.key, ...LANGUAGES.map(lang => (item as Record<string, string>)[lang] ?? '')].some(text => text.toLowerCase().includes(q)))
        return items.length ? [{ key: `section_${name}`, _section: t(`textsGroup_${name}`) }, ...items] : []
    })
})

// Columns: the key (with "changed" under it), then one column per language (click to edit)
const columns = computed(() => [
    {
        key: 'key',
        label: t('textKey'),
        disabled: true,
        formatter: (item: Record<string, any>) => `${item.key}${LANGUAGES.some(lang => isChanged(lang, item.key)) ? `<small class="cell-hint text-body-s">${t('textChanged')}</small>` : ''}`,
        tooltip: (item: Record<string, any>) => item.key,
    },
    ...LANGUAGES.map(lang => ({
        key: lang,
        label: lang.toUpperCase(),
        editValue: (item: Record<string, any>) => item[lang],
        formatter: (item: Record<string, any>) => escape(item[lang]) || '-',
        tooltip: (item: Record<string, any>) => item[lang],
    })),
])

// Saves a text; an empty text goes back to the default one.
// A French text changed: the other languages never changed by hand follow it (machine translation, MyMemory)
const handleUpdate = async ({ item, field, value }: { item: Record<string, any>, field: string, value: any }) => {
    if (value === item[field]) return
    const res = await siteTexts.save(field, item.key, value)
    if (!res.success) return showFailure(t('saveFailed'))
    const others = field === LANGUAGES[0] && String(value).trim() ? LANGUAGES.slice(1).filter(lang => !isChanged(lang, item.key)) : []
    if (!others.length) return showSuccess(t('textSaved'))

    const translated = await translateText(value, field, others)
    if (!translated.success) return showFailure(`${t('textSaved')} ${t(translated.error || 'translateUnavailable')}`)
    for (const lang of others) if (translated.translations?.[lang]) await siteTexts.save(lang, item.key, translated.translations[lang])
    showSuccess(t('textSavedTranslated'))
}
</script>

<style scoped>
/* Picker of the part of the site, above the table */
.texts-filter {
    max-width: 320px;
}
</style>
