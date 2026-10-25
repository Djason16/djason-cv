<template>
    <!-- Round icon button with an optional text, used to open the admin modals -->
    <div class="round-btn-wrapper">
        <button type="button" class="round-btn" :title="title" :aria-label="ariaLabel" @click="handleClick">
            <transition name="fade" mode="out-in">
                <div v-if="!hideContent" class="round-btn__content">
                    <div class="round-btn__icon-wrapper">
                        <i :class="icon" aria-hidden="true"></i>
                    </div>
                    <!-- Display text if provided -->
                    <span v-if="text" class="round-btn__text text-uppercase text-small text-bold">{{ text }}</span>
                </div>
            </transition>
        </button>
    </div>
</template>

<script setup>
defineProps({
    // Font Awesome classes of the icon
    icon: { type: String, required: true },
    title: { type: String, default: '' },
    ariaLabel: { type: String, default: '' },
    text: { type: String, default: '' },
    // true while its modal is open: icon and text hidden
    hideContent: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
    emit('click', event)
}
</script>
