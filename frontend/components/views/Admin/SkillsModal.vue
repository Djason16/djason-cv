<template>
    <!-- Skills added from the admin: shown on the home page in their group, and offered for the projects.
         A short form on top adds one; the table below changes (click a cell) or deletes them. -->
    <TableModal :show="show" :title="t('skillsAdminTitle')" max-width="1200px" @close="emit('close')">
        <!-- A new skill: its name and group, its two descriptions, then the button -->
        <section class="skill-add">
            <p class="eyebrow">{{ t('skillAddTitle') }}</p>
            <form class="skill-add__form" @submit.prevent="add">
                <div class="form-group">
                    <label for="skill-name">{{ t('skillName') }}</label>
                    <input id="skill-name" v-model="form.name" type="text" required maxlength="120" />
                </div>
                <div class="form-group">
                    <label for="skill-group">{{ t('skillGroup') }}</label>
                    <select id="skill-group" v-model="form.group_id">
                        <option v-for="g in groupOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="skill-fr">{{ t('skillDescriptionFr') }}</label>
                    <input id="skill-fr" v-model="form.description_fr" type="text" />
                </div>
                <!-- Filled from the French a moment after typing (MyMemory), still editable -->
                <div class="form-group">
                    <label for="skill-en">{{ t('skillDescriptionEn') }}
                        <span v-if="auto.status.description_fr" class="auto-translate">{{ t(auto.status.description_fr === 'done' ? 'translateDone' : 'translating') }}</span></label>
                    <input id="skill-en" v-model="form.description_en" type="text" />
                </div>
                <div class="skill-add__end">
                    <HeroButton type="submit" primary iconClass="fas fa-plus" :label="t('skillAdd')" :disabled="saving" />
                    <p class="skill-add__hint text-body-s">{{ t('skillsAdminHint') }}</p>
                </div>
            </form>
        </section>

        <!-- The skills added: changed in place (click a value), or deleted -->
        <p class="skill-list__title eyebrow">{{ t('skillsAddedTitle') }} · {{ customSkills.length }}</p>
        <EditableTable :items="customSkills" :columns="columns" :actions-label="t('actions')" :delete-label="t('delete')"
            :empty-message="t('skillsNone')" @update="handleUpdate" @delete="remove" />
    </TableModal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import HeroButton from '@/components/ui/Button/HeroButton.vue'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useLang } from '@/composables/useLang'
import { useSkills } from '@/composables/useSkills'
import { useAutoTranslate } from '@/composables/useAutoTranslate'
import { skillGroups } from '@/data/skills'
import { showConfirm, showFailure, showResult, showSuccess } from '@/utils/dialog'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { getTranslation: t } = useLang()
const { customSkills, fetchSkills, addSkill, updateSkill, removeSkill } = useSkills()

const groupOptions = computed(() => skillGroups.map(g => ({ value: g.id, label: t(g.labelKey) })))
const empty = () => ({ name: '', group_id: skillGroups[0]?.id ?? '', description_fr: '', description_en: '' })
const form = reactive(empty())
const saving = ref(false)
// French description -> English description, a moment after typing
const auto = useAutoTranslate(form, [['description_fr', 'description_en']])

// On a phone: the name, its group as a tag, its two descriptions alone (mobile)
const columns = computed(() => [
    { key: 'name', label: t('skillName') },
    { key: 'group_id', label: t('skillGroup'), type: 'select', options: groupOptions.value, mobile: 'tag',
        formatter: (s: Record<string, any>) => groupOptions.value.find(g => g.value === s.group_id)?.label || s.group_id },
    { key: 'description_fr', label: t('skillDescriptionFr'), inputType: 'textarea', formatter: (s: Record<string, any>) => s.description_fr || '-', mobile: 'plain' },
    { key: 'description_en', label: t('skillDescriptionEn'), inputType: 'textarea', formatter: (s: Record<string, any>) => s.description_en || '-', mobile: 'plain' },
])

const add = async () => {
    if (!form.name.trim()) return
    saving.value = true
    const res = await addSkill({ ...form })
    saving.value = false
    if (!res.success) return showFailure(t(res.error ?? '') || t('saveFailed'))
    Object.assign(form, empty())
    auto.reset()
    showSuccess(t('skillAdded'))
}

const handleUpdate = async ({ item, field, value }: { item: Record<string, any>, field: string, value: any }) => {
    if (value === item[field]) return
    const res = await updateSkill(item.id, { [field]: value })
    await showResult(res, t('saveSuccess'), t('saveFailed'))
}

const remove = async (item: Record<string, any>) => {
    if (!(await showConfirm(t('skillDeleteConfirm', { name: item.name }), { okLabel: t('dialogDelete') }))) return
    const res = await removeSkill(item.id)
    await showResult(res, t('deleteSuccess'), t('deleteFailed'))
}

watch(() => props.show, open => open && fetchSkills(), { immediate: true })
</script>

<style scoped>
/* The form: two fields per line on a computer, one on a phone; the button and the hint under them */
.skill-add {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid var(--line);
}

.skill-add .eyebrow,
.skill-list__title {
    margin: 0;
}

.skill-add__form {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem 1.5rem;
}

.skill-add__form .form-group {
    margin: 0;
}

.skill-add__end {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.5rem;
    grid-column: 1 / -1;
}

.skill-add__hint {
    flex: 1 1 18rem;
    margin: 0;
    color: var(--paper-muted);
}

.skill-add .auto-translate {
    margin-left: 0.5rem;
    color: var(--accent);
}

.skill-list__title {
    margin-top: 0.5rem;
}

@media (max-width: 600px) {
    .skill-add__form {
        grid-template-columns: 1fr;
    }
}
</style>
