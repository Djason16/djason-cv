<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewInterestRates')" @close="close">
        <div class="interest-rates-list-modal">
            <!-- Search bar -->
            <div class="search-bar">
                <input v-model="search" id="rate-search" type="text"
                    :placeholder="$lang.getTranslation('searchInterestRates')" class="text-small" autocomplete="off"
                    :title="$lang.getTranslation('searchInterestRates')" />
            </div>

            <!-- Editable rates table -->
            <EditableTable :items="filteredInterestRates" :columns="columns"
                :actions-label="$lang.getTranslation('actions')" :delete-label="$lang.getTranslation('delete')"
                :empty-message="$lang.getTranslation('noInterestRatesFound')" @update="handleUpdate"
                @delete="deleteInterestRate" />

            <!-- Footer -->
            <div class="modal-footer">
                <HeroButton type="button" :label="$lang.getTranslation('close')" iconClass="fas fa-times"
                    @click="close" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { computed, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useInterestRates } from '~/composables/useInterestRates'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const { $lang, interestRates, search, fetchInterestRates, filteredInterestRates, formatRate, formatDate, isActiveRate } = useInterestRates()

// Table structure with formatters and editable definitions
const columns = computed(() => [
    { key: 'rate', label: $lang.getTranslation('rate'), formatter: r => formatRate(r.rate), editValue: r => r.rate, inputType: 'number', step: '0.0001', min: '0', max: '1', autocomplete: 'off' },
    { key: 'valid_from', label: $lang.getTranslation('validFrom'), formatter: r => formatDate(r.valid_from), editValue: r => r.valid_from, inputType: 'date', autocomplete: 'off' },
    { key: 'valid_until', label: $lang.getTranslation('validUntil'), formatter: r => formatDate(r.valid_until), editValue: r => r.valid_until, inputType: 'date', autocomplete: 'off' },
    { key: 'status', label: $lang.getTranslation('status'), formatter: r => isActiveRate(r) ? $lang.getTranslation('active') : $lang.getTranslation('inactive'), disabled: true }
])

// Load data when modal opens
watch(() => props.show, v => v && fetchInterestRates())

// Update interest rate in backend
const handleUpdate = async ({ item, field, value }) => {
    item[field] = value
    try {
        await $fetch('/api/interest-rates/edit-interest-rates', { method: 'PUT', body: { id: item.id, rate: item.rate, valid_from: item.valid_from, valid_until: item.valid_until } })
    } catch (e) { console.error('Failed updating interest rate', e) }
}

// Delete interest rate with user confirmation
const deleteInterestRate = async r => {
    if (!confirm($lang.getTranslation('deleteInterestRateConfirm', { rate: formatRate(r.rate) }))) return
    try {
        const res = await $fetch('/api/interest-rates/delete-interest-rates', { method: 'POST', body: { id: r.id } })
        res.success ? interestRates.value = interestRates.value.filter(rate => rate.id !== r.id) : alert(res.error || $lang.getTranslation('deleteInterestRateFailed'))
    } catch (e) {
        console.error(e)
        alert($lang.getTranslation('deleteInterestRateFailed'))
    }
}

// Close modal
const close = () => emit('close')
</script>

<style scoped>
.interest-rates-list-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
    min-width: 50vw;
    max-height: 80vh;
    overflow: hidden;
    color: var(--text-color-dark);
    box-sizing: border-box;
}

.search-bar {
    display: flex;
    justify-content: flex-end;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto;
}
</style>