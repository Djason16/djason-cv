<!-- Lines of a draft: description (and details), quantity, unit, unit price, VAT, total; add, remove, or import the missions of the client -->
<template>
    <section class="editor-lines">
        <p class="eyebrow">{{ t('billLines') }}</p>

        <div v-for="(line, i) in lines" :key="i" class="editor-lines__line">
            <span class="editor-lines__number eyebrow">{{ padIndex(i) }}</span>
            <div class="editor-lines__fields">
                <input v-model="line.description" type="text" class="editor-lines__name" :placeholder="t('billLinePlaceholder')"
                    :aria-label="t('billDescription')" @input="emitLines" />
                <input v-model="line.details" type="text" :placeholder="t('billDetailsPlaceholder')" :aria-label="t('billDetailsPlaceholder')" @input="emitLines" />
                <div class="editor-lines__numbers">
                    <label>
                        <span class="text-label">{{ t('billQuantity') }}</span>
                        <input v-model.number="line.quantity" type="number" min="0" step="0.25" @input="emitLines" />
                    </label>
                    <label>
                        <span class="text-label">{{ t('billUnit') }}</span>
                        <input v-model="line.unit" type="text" placeholder="h, j, u" @input="emitLines" />
                    </label>
                    <label>
                        <span class="text-label">{{ t('billPriceShort') }}</span>
                        <input v-model.number="line.unitPrice" type="number" min="0" step="0.01" @input="emitLines" />
                    </label>
                    <label>
                        <span class="text-label">{{ t('billVat') }}</span>
                        <select v-model.number="line.vatRate" @change="emitLines">
                            <option v-for="rate in VAT_RATES" :key="rate" :value="rate">{{ rate ? `${rate * 100} %` : '0 %' }}</option>
                        </select>
                    </label>
                </div>
                <!-- Under the fields, the whole width: the total of the line (any amount fits), and its delete -->
                <div class="editor-lines__end">
                    <span class="editor-lines__total-label text-label">{{ t('billLineTotal') }}</span>
                    <span class="editor-lines__total text-display-xs">{{ money(lineTotal(line)) }}</span>
                    <IconButton icon="trash" variant="danger" :label="t('billRemoveLine')" @click="remove(i)" />
                </div>
            </div>
        </div>

        <div class="editor-lines__add">
            <HeroButton iconClass="fas fa-plus" :label="t('billAddLine')" @click="add()" />
            <HeroButton v-if="open.length" iconClass="fas fa-file-import" :label="`${t('billImportMissions')} (${open.length})`" @click="picking = !picking" />
        </div>

        <!-- The missions of the client not billed yet, as a table of the site: tick the ones to put on this document, together -->
        <Transition name="editor-missions">
            <div v-if="picking && open.length" class="editor-missions">
                <div class="editor-missions__head">
                    <p class="eyebrow">{{ t('billPickMissions') }}</p>
                    <button type="button" class="editor-missions__all text-label" @click="toggleAll">{{ t(allPicked ? 'billPickNone' : 'billPickAll') }}</button>
                </div>
                <div class="editor-missions__row editor-missions__row--head text-label" aria-hidden="true">
                    <span></span><span>{{ t('missionTitle') }}</span><span>{{ t('missionDate') }}</span><span>{{ t('billMissionTime') }}</span><span>{{ t('billMissionAmount') }}</span>
                </div>
                <label v-for="m in open" :key="m.id" class="editor-missions__row" :class="{ 'is-picked': picked.includes(m.id) }">
                    <input v-model="picked" type="checkbox" class="editor-missions__tick" :value="m.id" />
                    <span class="editor-missions__name">
                        <span class="text-body">{{ m.title || '—' }}</span>
                        <span v-if="m.description" class="text-body-s">{{ m.description }}</span>
                    </span>
                    <span class="text-body-s">{{ dateOf(m) }}</span>
                    <span class="text-body-s">{{ timeOf(m) }}</span>
                    <span class="editor-missions__amount text-display-xs">{{ money(m.unit_price) }}</span>
                </label>
                <div class="editor-missions__foot">
                    <span class="editor-missions__total text-label">{{ t('billPickedTotal', { count: picked.length, amount: money(pickedTotal) }) }}</span>
                    <HeroButton :primary="picked.length > 0" iconClass="fas fa-plus" :label="t('billAddPicked', { count: picked.length })" :disabled="!picked.length" @click="importMissions" />
                </div>
            </div>
        </Transition>
    </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import IconButton from '@/components/ui/Button/IconButton.vue'
import { useLang } from '@/composables/useLang.js'
import { VAT_RATES, lineTotal } from '@/utils/billing.js'
import { padIndex } from '@/utils/display.js'
import { VAT_RATE } from '@/utils/documents.js'

const lines = defineModel({ type: Array, default: () => [] })
const props = defineProps({
    // Missions of the client of the document (stores/adminData.js)
    missions: { type: Array, default: () => [] },
    // The missions to tick shown at once, all ticked (a new invoice of the missions of a client, from the dashboard)
    startPicking: Boolean,
})

const lang = useLang()
const t = lang.getTranslation
const locale = computed(() => lang.current.value === 'fr' ? 'fr-FR' : 'en-GB')
const money = value => new Intl.NumberFormat(locale.value, { style: 'currency', currency: 'EUR' }).format(Number(value) || 0)

// The lines are changed in place: a new array tells the parent (preview, totals)
const emitLines = () => { lines.value = [...lines.value] }
const add = (line = {}) => { lines.value = [...lines.value, { description: '', details: '', quantity: 1, unit: '', unitPrice: 0, vatRate: 0, ...line }] }
const remove = i => { lines.value = lines.value.filter((_, j) => j !== i) }

// Missions of the client not billed yet (and not already lines of this document), the latest first
const open = computed(() => {
    const here = new Set(lines.value.map(l => l.missionId).filter(Boolean))
    return props.missions.filter(m => !m.invoice_id && !here.has(m.id)).sort((a, b) => String(b.date).localeCompare(String(a.date)))
})
const dateOf = m => m.date ? new Date(`${String(m.date).slice(0, 10)}T12:00:00`).toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const longDate = m => m.date ? new Date(`${String(m.date).slice(0, 10)}T12:00:00`).toLocaleDateString(locale.value, { day: 'numeric', month: 'long', year: 'numeric' }) : ''
// Time spent: "7 h × 2" (hours of a day × days); a fixed price: "Forfait"
const hours = value => `${String(Math.round(Number(value) * 100) / 100).replace('.', lang.current.value === 'fr' ? ',' : '.')} h`
const timeOf = m => m.tjm > 0 ? `${hours(m.duration)}${Number(m.quantity) > 1 ? ` × ${m.quantity}` : ''}` : `${t('billMissionFixed')}${Number(m.quantity) > 1 ? ` × ${m.quantity}` : ''}`

// The missions ticked (none at first: the admin picks what goes together)
const picking = ref(false)
const picked = ref([])
const allPicked = computed(() => open.value.length > 0 && picked.value.length === open.value.length)
const pickedTotal = computed(() => open.value.filter(m => picked.value.includes(m.id)).reduce((sum, m) => sum + (Number(m.unit_price) || 0), 0))
const toggleAll = () => { picked.value = allPicked.value ? [] : open.value.map(m => m.id) }
watch(open, list => { picked.value = picked.value.filter(id => list.some(m => m.id === id)) })
watch(() => props.startPicking && open.value.length, ready => {
    if (!ready || picking.value) return
    picking.value = true
    picked.value = open.value.map(m => m.id)
}, { immediate: true })

// The missions ticked -> lines, the empty first line replaced: time spent in hours (rate × hours × quantity),
// a fixed price as it is; each line keeps its mission (marked billed when the invoice is finalized)
const importMissions = () => {
    const imported = open.value.filter(m => picked.value.includes(m.id)).map(m => ({
        description: m.title?.trim() || '',
        // Under the title on the document: its date in full, then its description
        details: [t('billMissionOn', { date: longDate(m) }), m.description?.trim()].filter(Boolean).join(' · '),
        quantity: m.tjm > 0 ? Math.round((Number(m.duration) || 1) * (Number(m.quantity) || 1) * 100) / 100 : Number(m.quantity) || 1,
        unit: m.tjm > 0 ? 'h' : '',
        unitPrice: m.tjm > 0 ? Number(m.tjm) : Math.round((Number(m.unit_price) || 0) / (Number(m.quantity) || 1) * 100) / 100,
        vatRate: m.vat_applicable ? VAT_RATE : 0,
        missionId: m.id,
    }))
    const kept = lines.value.filter(l => l.description || Number(l.unitPrice) > 0)
    lines.value = [...kept, ...imported]
    picked.value = []
    picking.value = false
}
</script>
