<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('addClient')" @close="close">
        <form ref="formRef" @submit.prevent="handleSubmit" class="client-form" :class="{ 'has-scroll': hasScroll }">
            <!-- Hidden dummy input to avoid password manager interference -->
            <input type="text" name="dummy" autocomplete="username"
                style="position:absolute;opacity:0;width:0;height:0;border:none;margin:0;padding:0" tabindex="-1" />

            <!-- Render dynamic field groups -->
            <div v-for="(group, i) in groupedFields" :key="i" class="row-group">
                <div v-for="f in group" :key="f.id" class="form-group">
                    <label :for="f.id">{{ $lang.getTranslation(f.labelKey) }}</label>
                    <input :id="f.id" v-model="refsMap[f.id]" :type="f.type"
                        :placeholder="$lang.getTranslation(f.placeholderKey)" :title="$lang.getTranslation(f.labelKey)"
                        :aria-label="$lang.getTranslation(f.labelKey)" :required="f.required"
                        :autocomplete="f.autocomplete" />
                </div>
            </div>

            <!-- Client type select -->
            <div class="form-group">
                <label for="type">{{ $lang.getTranslation('clientType') }}</label>
                <select id="type" v-model="refsMap.type" required>
                    <option value="individual">{{ $lang.getTranslation('individual') }}</option>
                    <option value="company">{{ $lang.getTranslation('company') }}</option>
                    <option value="freelance">{{ $lang.getTranslation('freelance') }}</option>
                </select>
            </div>

            <MessageBox :message="translatedMessage" />

            <!-- Modal actions -->
            <div class="modal-footer">
                <HeroButton type="button" :label="$lang.getTranslation('cancel')" iconClass="fas fa-times"
                    @click="close" />
                <HeroButton type="submit"
                    :label="loading ? $lang.getTranslation('saving') : $lang.getTranslation('save')"
                    iconClass="fas fa-check" :disabled="loading" />
            </div>
        </form>
    </ModalDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useNuxtApp } from '#app'
import ModalDialog from '../ModalDialog.vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import { useMessage } from '~/composables/useMessage'

const { $lang } = useNuxtApp()
const { translatedMessage, showMessage, clearMessage } = useMessage()
const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

const loading = ref(false)
const formRef = ref(null)
const hasScroll = ref(false)

// Reactive form data
const refsMap = reactive({
    firstname: '', lastname: '', company_name: '', email: '', phone: '',
    address: '', postal_code: '', city: '', siret: '', type: 'individual'
})

// Field definitions
const clientFields = [
    { id: 'firstname', labelKey: 'firstName', placeholderKey: 'enterFirstName', type: 'text', required: true, autocomplete: 'given-name' },
    { id: 'lastname', labelKey: 'lastName', placeholderKey: 'enterLastName', type: 'text', required: true, autocomplete: 'family-name' },
    { id: 'company_name', labelKey: 'companyName', placeholderKey: 'enterCompanyName', type: 'text', required: true, autocomplete: 'organization' },
    { id: 'email', labelKey: 'emailAddress', placeholderKey: 'enterEmail', type: 'email', required: true, autocomplete: 'email' },
    { id: 'phone', labelKey: 'phoneNumber', placeholderKey: 'enterPhone', type: 'tel', required: false, autocomplete: 'tel' },
    { id: 'address', labelKey: 'address', placeholderKey: 'enterAddress', type: 'text', required: false, autocomplete: 'street-address' },
    { id: 'postal_code', labelKey: 'postalCode', placeholderKey: 'enterPostalCode', type: 'text', required: false, autocomplete: 'postal-code' },
    { id: 'city', labelKey: 'city', placeholderKey: 'enterCity', type: 'text', required: false, autocomplete: 'address-level2' },
    { id: 'siret', labelKey: 'siret', placeholderKey: 'enterSiret', type: 'text', required: true, autocomplete: 'off' }
]

// Filter visible fields by client type
const visibleFields = computed(() => {
    if (refsMap.type === 'company') return clientFields.filter(f => !['firstname', 'lastname'].includes(f.id))
    if (refsMap.type === 'freelance') return clientFields.filter(f => f.id !== 'company_name')
    return clientFields.filter(f => !['company_name', 'siret'].includes(f.id))
})

// Group fields for row layout
const groupedFields = computed(() => {
    const groups = []
    const addGroup = ids => { const g = visibleFields.value.filter(f => ids.includes(f.id)); if (g.length) groups.push(g) }
    addGroup(['firstname', 'lastname'])
    addGroup(['email', 'phone'])
    addGroup(['address'])
    addGroup(['postal_code', 'city'])
    addGroup(['company_name', 'siret'])
    const usedIds = groups.flat().map(f => f.id)
    visibleFields.value.filter(f => !usedIds.includes(f.id)).forEach(f => groups.push([f]))
    return groups
})

// Detect scroll for form
const checkScroll = () => formRef.value && (hasScroll.value = formRef.value.scrollHeight > formRef.value.clientHeight)

// Watch resize & DOM changes
let observer
onMounted(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    if (formRef.value) {
        observer = new MutationObserver(() => setTimeout(checkScroll, 50))
        observer.observe(formRef.value, { childList: true, subtree: true, characterData: true })
    }
})
onBeforeUnmount(() => { observer?.disconnect(); window.removeEventListener('resize', checkScroll) })
watch(() => props.show, () => setTimeout(checkScroll, 100))
watch(() => refsMap.type, () => setTimeout(checkScroll, 50))

// Reset and close modal
const close = () => {
    Object.keys(refsMap).forEach(k => refsMap[k] = k === 'type' ? 'individual' : '')
    clearMessage()
    loading.value = false
    emit('close')
}

// Submit form and show messages
const handleSubmit = async () => {
    clearMessage()
    loading.value = true
    try {
        await $fetch('/api/clients/create-client', { method: 'POST', body: { ...refsMap } })
        showMessage('success', $lang.getTranslation('clientAdded'), 1500)
        setTimeout(() => { close(); emit('saved') }, 1500)
    } catch (err) {
        showMessage('error', err.message || $lang.getTranslation('errorSavingClient'), 0)
    } finally { loading.value = false }
}
</script>

<style scoped>
.client-form,
.form-group,
.modal-footer {
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease
}

.client-form {
    gap: 2rem;
    min-width: 25vw;
    max-width: 90vw;
    max-height: 60vh;
    overflow-y: auto;
    padding: 0;
    box-sizing: border-box
}

.client-form.has-scroll {
    padding-right: 1rem
}

.row-group {
    display: flex;
    flex-direction: column;
    gap: 1rem
}

.row-group .form-group {
    flex: 1
}

.modal-footer {
    gap: 1rem;
    margin-top: auto
}

::v-deep(.message-box p) {
    margin: 0
}

@media (min-width:1025px) {
    .row-group {
        flex-direction: row
    }
}

@media (max-width:1024px) {
    .client-form {
        width: 100%;
        min-width: auto;
        max-width: 90vw
    }
}
</style>