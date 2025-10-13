<template>
    <!-- Button wrapper with optional text -->
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
/** Props for icon, accessible labels, and optional text */
defineProps({
    icon: { type: String, required: true },      // Font Awesome icon class
    title: { type: String, default: '' },        // Tooltip/title attribute
    ariaLabel: { type: String, default: '' },    // Screen-reader label
    text: { type: String, default: '' },         // Optional button text
    hideContent: { type: Boolean, default: false }  // Hide icon and text when modal is open
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
    emit('click', event)
}
</script>

<style scoped>
.round-btn-wrapper {
    width: 10rem;
    height: 12rem;
    display: flex;
    justify-content: center;
    align-items: center;
}

.round-btn {
    background: linear-gradient(135deg, var(--second-color) 0%, var(--third-color) 100%);
    color: var(--text-color-light);
    border: none;
    border-radius: 50%;
    width: 10rem;
    height: 10rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    opacity: 0.9;
    transition: all 0.3s ease;
    will-change: transform, opacity, box-shadow;
}

.round-btn:hover {
    opacity: 1;
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.round-btn__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
}

.round-btn__icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0.25rem;
}

.round-btn__icon-wrapper i {
    font-size: 2.5rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.round-btn__text {
    line-height: 1.2rem;
    text-align: center;
    word-wrap: break-word;
    max-width: 100%;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 1024px) {
    .round-btn {
        will-change: auto;
        opacity: 0.9;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .round-btn:hover {
        transform: none;
    }
}

@media (max-width: 768px) {
    .round-btn-wrapper {
        width: 8rem;
        height: 10rem;
    }

    .round-btn {
        width: 8rem;
        height: 8rem;
        gap: 0.125rem;
    }

    .round-btn__icon-wrapper i {
        font-size: 2rem;
    }
}

@media (max-width: 480px) {
    .round-btn {
        gap: 0.0625rem;
    }
}
</style>