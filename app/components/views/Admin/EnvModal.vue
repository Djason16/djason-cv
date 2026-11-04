<template>
    <!-- Variables of the .env file -->
    <TableModal :show="show" :title="t('viewEnvironmentVariables')" max-width="1200px" @close="close">
        <EditableTable :items="formattedItems" :columns="columns" :show-actions="false" :item-key="'key'"
            :empty-message="t('noEnvVars')" @update="handleUpdate" />
    </TableModal>
</template>

<script setup>
import { useLang } from '@/composables/useLang.js'
import { computed, watch } from 'vue'
import EditableTable from '@/components/ui/Table/EditableTable.vue'
import { useEnv } from '@/composables/useEnv.js'
import TableModal from '@/components/ui/Modal/TableModal.vue'
import { showFailure, showSuccess } from '@/utils/dialog.js'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const lang = useLang()
const { getTranslation: t } = lang
const { envVars, fetchEnvVars, updateEnvVars } = useEnv()

// Variables by part, in the order of .env.example (mode, site, database, admin, emails, payments, bank, translation, area)
const envCategories = {
    mode: ['NODE_ENV'],
    site: ['NUXT_PUBLIC_FRONTEND_DOMAIN'],
    database: ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASS'],
    admin: ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME', 'SECURITY_ANSWER'],
    emails: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS'],
    payments: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
    bank: ['BANK_IBAN', 'BANK_BIC'],
    translation: ['MYMEMORY_EMAIL'],
    area: ['GOOGLE_MAPS_API_KEY'],
}
const known = new Set(Object.values(envCategories).flat())

// Rows of the table: a title row per part, then its variables (a missing one shows empty: filling it adds it to the file);
// variables of the file not listed above come last, in alphabetical order
const formattedItems = computed(() => {
    if (!envVars.value) return []
    const others = Object.keys(envVars.value).filter(key => !known.has(key)).sort()
    return [...Object.entries(envCategories), ...(others.length ? [['others', others]] : [])].flatMap(([category, keys]) => [
        { key: `section_${category}`, _section: t(`envGroup_${category}`) },
        ...keys.map(key => ({ key, value: envVars.value[key] ?? '', sensitive: isSensitiveField(key) })),
    ])
})

// Passwords, keys and bank details: hidden in the table and while edited
const isSensitiveField = key => ['PASSWORD', 'SECRET', 'PASS', 'IBAN', 'BIC', 'ANSWER'].some(word => key.includes(word))

// Table: a clear name with the name of the variable under it, then its value (click to edit)
const columns = computed(() => [
    {
        key: 'field',
        label: lang.getTranslation('field'),
        disabled: true,
        formatter: item => `${known.has(item.key) ? t(`env_${item.key}`) : item.key}<small class="cell-hint text-body-s">${item.key}</small>`,
        tooltip: item => item.key,
    },
    {
        key: 'value',
        label: lang.getTranslation('value'),
        mobile: 'plain',
        inputType: item => item.sensitive ? 'password' : 'text',
        editValue: item => item.value,
        formatter: item => item.sensitive && item.value ? '••••••••' : item.value || '-',
        tooltip: item => item.sensitive ? '' : item.value,
    }
])

// Handles updates from the table
const handleUpdate = async ({ item, field, value }) => {
    if (!item?.key) return console.error('No item key')

    try {
        await updateEnvVars({ [item.key]: value }, () => showSuccess(lang.getTranslation('envSaved')))
    } catch {
        await showFailure(lang.getTranslation('saveFailed'))
    }
}

// Fetches environment variables when modal opens
watch(() => props.show, val => val && fetchEnvVars())
const close = () => emit('close')
</script>
