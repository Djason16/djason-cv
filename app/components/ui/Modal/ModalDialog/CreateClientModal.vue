<template>
    <ModalDialog :show="show" :title="$lang.getTranslation('addClient')" @close="close">
        <form ref="formRef" @submit.prevent="handleSubmit" class="client-form" :class="{ 'has-scroll': hasScroll }">
            <!-- Hidden input to prevent password manager interference -->
            <input type="text" name="dummy" autocomplete="username"
                style="position:absolute;opacity:0;width:0;height:0;border:none;margin:0;padding:0" tabindex="-1" />

            <!-- Dynamic grouped fields -->
            <div v-for="(group, i) in groupedFields" :key="i" class="row-group">
                <div v-for="f in group" :key="f.id" class="form-group">
                    <label :for="f.id">{{ $lang.getTranslation(f.labelKey) }}</label>
                    <input :id="f.id" v-model="refsMap[f.id]" :type="f.type"
                        :placeholder="$lang.getTranslation(f.placeholderKey)" :title="$lang.getTranslation(f.labelKey)"
                        :aria-label="$lang.getTranslation(f.labelKey)" :required="f.required"
                        :autocomplete="f.autocomplete" />
                </div>
            </div>

            <!-- Client type selector -->
            <div class="form-group">
                <label for="type">{{ $lang.getTranslation('clientType') }}</label>
                <select id="type" v-model="refsMap.type" required :title="$lang.getTranslation('clientType')"
                    :aria-label="$lang.getTranslation('clientType')">
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
                    :label="formLoading ? $lang.getTranslation('saving') : $lang.getTranslation('save')"
                    iconClass="fas fa-check" :disabled="formLoading" />
            </div>
        </form>
    </ModalDialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import HeroButton from '~/components/ui/Button/HeroButton.vue'
import MessageBox from '~/components/ui/Message/MessageBox.vue'
import ModalDialog from '../ModalDialog.vue'
import { useClients } from '~/composables/useClients'
import { useMessage } from '~/composables/useMessage'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close', 'saved'])

const { $lang, getVisibleFields, groupFields } = useClients()
const { translatedMessage, showMessage, clearMessage } = useMessage()

const formRef = ref(null)
const formLoading = ref(false)
const hasScroll = ref(false)

// Reactive form data
const refsMap = reactive({ firstname: '', lastname: '', company_name: '', email: '', phone: '', address: '', postal_code: '', city: '', siret: '', type: 'individual' })

// Compute visible fields and group them by layout
const visibleFields = computed(() => getVisibleFields(refsMap.type))
const groupedFields = computed(() => groupFields(visibleFields.value))

// Check if form content exceeds container height
const checkScroll = () => formRef.value && (hasScroll.value = formRef.value.scrollHeight > formRef.value.clientHeight)

// Observe DOM changes and window resize
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

// Recheck scroll on modal show or type change
watch(() => props.show, () => setTimeout(checkScroll, 100))
watch(() => refsMap.type, () => setTimeout(checkScroll, 50))

// Reset form and close modal
const close = () => {
    Object.keys(refsMap).forEach(k => refsMap[k] = k === 'type' ? 'individual' : '')
    clearMessage()
    formLoading.value = false
    emit('close')
}

// Submit form and show feedback messages
const handleSubmit = async () => {
    clearMessage()
    formLoading.value = true
    try {
        await $fetch('/api/clients/create-client', { method: 'POST', body: { ...refsMap } })
        showMessage('success', $lang.getTranslation('clientAdded'), 1500)
        setTimeout(() => { close(); emit('saved') }, 1500)
    } catch (err) {
        showMessage('error', err.message || $lang.getTranslation('errorSavingClient'), 0)
    } finally { formLoading.value = false }
}
</script>

<style scoped>
.client-form,
.form-group,
.modal-footer {
    display: flex;
    flex-direction: column;
    transition: all .3s ease
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

.form-group {
    gap: .5rem
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