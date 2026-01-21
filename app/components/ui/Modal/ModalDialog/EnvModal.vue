<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('viewEnvironmentVariables')" @close="close">
        <div class="env-modal">
            <!-- Editable table showing all environment variables -->
            <EditableTable :items="formattedItems" :columns="columns" :show-actions="false" :item-key="'key'"
                :empty-message="$lang.getTranslation('noEnvVars')" @update="handleUpdate" />
            <div class="modal-footer">
                <HeroButton :label="$lang.getTranslation('close')" iconClass="fas fa-times" @click="close" />
            </div>
        </div>
    </ModalDialog>
</template>

<script setup>
import { computed, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import EditableTable from '~/components/ui/Table/EditableTable.vue'
import { useEnv } from '~/composables/useEnv'
import ModalDialog from '../ModalDialog.vue'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const { $lang } = useNuxtApp()
const { envVars, fetchEnvVars, updateEnvVars } = useEnv()

// Group environment variables by category
const envCategories = {
    environment: ['NODE_ENV'],
    frontend: ['NUXT_PUBLIC_FRONTEND_DOMAIN'],
    stripe: ['NUXT_PUBLIC_STRIPE_PUBLIC_KEY', 'STRIPE_SECRET_KEY'],
    admin: ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_NAME'],
    security: ['SECURITY_ANSWER'],
    smtp: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE', 'SMTP_USER', 'SMTP_PASS'],
    personal: ['NUXT_PUBLIC_PERSONAL_NAME', 'NUXT_PUBLIC_PERSONAL_EMAIL', 'NUXT_PUBLIC_PERSONAL_PHONE', 'NUXT_PUBLIC_PERSONAL_BIRTHDATE'],
    legal_env: ['NUXT_PUBLIC_LEGAL_SIRET', 'NUXT_PUBLIC_LEGAL_TVA', 'NUXT_PUBLIC_LEGAL_ADDRESS', 'NUXT_PUBLIC_LEGAL_INVOICE_ADDRESS'],
    bank: ['BANK_IBAN', 'BANK_BIC'],
    social: ['NUXT_PUBLIC_LINKEDIN', 'NUXT_PUBLIC_GITHUB', 'NUXT_PUBLIC_MALT', 'NUXT_PUBLIC_INSTAGRAM', 'NUXT_PUBLIC_WHATSAPP']
}

// Format items with category headers
const formattedItems = computed(() => {
    if (!envVars.value) return []

    const items = []

    Object.entries(envCategories).forEach(([category, keys]) => {
        // Add category header
        items.push({
            key: `header_${category}`,
            field: $lang.getTranslation(category),
            value: '',
            _type: 'header'
        })

        // Add variables in this category
        keys.forEach(key => {
            if (envVars.value[key] !== undefined) {
                items.push({
                    key,
                    field: formatFieldName(key),
                    value: envVars.value[key],
                    _type: 'variable',
                    _sensitive: isSensitiveField(key)
                })
            }
        })
    })

    return items
})

// Format field name for display (remove prefixes, convert to title case)
const formatFieldName = (key) => {
    return key
        .replace(/^NUXT_PUBLIC_/, '')
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase())
}

// Check if field contains sensitive data
const isSensitiveField = (key) => {
    const sensitiveKeys = ['PASSWORD', 'SECRET', 'PASS', 'IBAN', 'BIC', 'ANSWER']
    return sensitiveKeys.some(s => key.includes(s))
}

// Table column definitions
const columns = computed(() => [
    {
        key: 'field',
        label: $lang.getTranslation('field'),
        disabled: true,
        formatter: item => item.field
    },
    {
        key: 'value',
        label: $lang.getTranslation('value'),
        inputType: item => item._sensitive ? 'password' : 'text',
        disabled: item => item._type === 'header',
        editValue: item => item.value,
        formatter: item => {
            if (item._type === 'header') return '-'
            if (item._sensitive) return '••••••••'
            return item.value || '-'
        }
    }
])

// Handle updates from the table
const handleUpdate = async ({ item, field, value }) => {
    if (item._type === 'header') return
    if (!item?.key) return console.error('No item key')

    try {
        await updateEnvVars({ [item.key]: value })
    } catch (err) {
        console.error('Update failed:', err)
    }
}

// Fetch environment variables when modal opens
watch(() => props.show, val => val && fetchEnvVars())
const close = () => emit('close')
</script>

<style scoped>
.env-modal {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 100%;
    max-width: 1200px;
    min-width: 60vw;
    max-height: 80vh;
    overflow: hidden;
    color: var(--text-color-dark);
    box-sizing: border-box;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    margin-top: auto;
}
</style>